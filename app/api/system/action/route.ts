import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

type Action = 'restart-gateway' | 'health-check' | 'clear-error-backoff'

const PROJECT_ROOT = '/Users/jaredbot/.openclaw/workspace-hex/projects/mission-control'

const ACTION_COMMANDS: Record<Action, { command: string; args: string[]; success: string }> = {
  'restart-gateway': {
    command: 'openclaw',
    args: ['gateway', 'restart'],
    success: 'Gateway restart command sent.',
  },
  'health-check': {
    command: 'openclaw',
    args: ['gateway', 'status'],
    success: 'Health check complete.',
  },
  'clear-error-backoff': {
    command: 'openclaw',
    args: ['cron', 'wake', '--text', 'Operator wake: clear blocked-job backoff and retry due jobs.', '--mode', 'now'],
    success: 'Backoff clear wake event sent.',
  },
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { action?: Action }
    const action = body.action

    if (!action || !(action in ACTION_COMMANDS)) {
      return Response.json({ ok: false, error: 'Invalid action.' }, { status: 400 })
    }

    const config = ACTION_COMMANDS[action]
    const { stdout, stderr } = await execFileAsync(config.command, config.args, {
      cwd: PROJECT_ROOT,
      timeout: 20_000,
    })

    return Response.json({
      ok: true,
      message: config.success,
      output: [stdout, stderr].filter(Boolean).join('\n').trim(),
    })
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'System action failed.',
      },
      { status: 500 },
    )
  }
}
