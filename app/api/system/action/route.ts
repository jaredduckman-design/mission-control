import { execFile } from 'child_process'
import { promisify } from 'util'
import { NextResponse } from 'next/server'

const execFileAsync = promisify(execFile)
const PROJECT_ROOT = '/Users/jaredbot/.openclaw/workspace-hex/projects/mission-control'

type SystemAction = 'restart-gateway' | 'health-check' | 'clear-error-backoff'

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { action?: SystemAction } | null
  const action = body?.action

  if (!action) return NextResponse.json({ ok: false, error: 'action is required' }, { status: 400 })

  try {
    if (action === 'restart-gateway') {
      const { stdout, stderr } = await execFileAsync('openclaw', ['gateway', 'restart'], { cwd: PROJECT_ROOT, timeout: 20000 })
      return NextResponse.json({ ok: true, message: 'Gateway restart requested.', output: `${stdout}${stderr}`.trim() })
    }

    if (action === 'health-check') {
      const [{ stdout: gatewayStatus }, { stdout: cronStatus }] = await Promise.all([
        execFileAsync('openclaw', ['gateway', 'status'], { cwd: PROJECT_ROOT, timeout: 20000 }),
        execFileAsync('openclaw', ['cron', 'status'], { cwd: PROJECT_ROOT, timeout: 20000 }),
      ])

      return NextResponse.json({
        ok: true,
        message: 'Gateway and cron status collected.',
        output: `Gateway:\n${gatewayStatus.trim()}\n\nCron:\n${cronStatus.trim()}`,
      })
    }

    const { stdout } = await execFileAsync('openclaw', ['cron', 'list', '--json', '--include-disabled'], {
      cwd: PROJECT_ROOT,
      timeout: 20000,
    })

    return NextResponse.json({
      ok: true,
      message: 'Cron state refreshed. Error backoff in Mission Control is derived from live cron state.',
      output: stdout.trim(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'command failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
