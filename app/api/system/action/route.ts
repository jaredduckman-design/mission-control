import { execFile } from 'child_process'
import { promisify } from 'util'
import { NextResponse } from 'next/server'

const execFileAsync = promisify(execFile)
const PROJECT_ROOT = '/Users/jaredbot/.openclaw/workspace-hex/projects/mission-control'

type SystemAction = 'restart-gateway' | 'health-check' | 'clear-error-backoff'

type CronJob = {
  id: string
  enabled?: boolean
  state?: {
    consecutiveErrors?: number
  }
}

async function runOpenclaw(args: string[]) {
  return execFileAsync('openclaw', args, { cwd: PROJECT_ROOT, timeout: 30000 })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { action?: SystemAction } | null
  const action = body?.action

  if (!action) return NextResponse.json({ ok: false, error: 'action is required' }, { status: 400 })

  try {
    if (action === 'restart-gateway') {
      const { stdout, stderr } = await runOpenclaw(['gateway', 'restart'])
      return NextResponse.json({ ok: true, message: 'Gateway restart requested.', output: `${stdout}${stderr}`.trim() })
    }

    if (action === 'health-check') {
      const [{ stdout: gatewayStatus }, { stdout: cronStatus }, { stdout: healthStatus }] = await Promise.all([
        runOpenclaw(['gateway', 'status']),
        runOpenclaw(['cron', 'status']),
        runOpenclaw(['health']),
      ])

      return NextResponse.json({
        ok: true,
        message: 'Gateway + cron + health status collected.',
        output: `Gateway:\n${gatewayStatus.trim()}\n\nCron:\n${cronStatus.trim()}\n\nHealth:\n${healthStatus.trim()}`,
      })
    }

    const { stdout } = await runOpenclaw(['cron', 'list', '--json', '--include-disabled'])
    const jobs = JSON.parse(stdout) as CronJob[]

    const retryable = jobs.filter((job) => job.enabled !== false && (job.state?.consecutiveErrors ?? 0) > 0)

    if (!retryable.length) {
      return NextResponse.json({
        ok: true,
        message: 'No errored cron jobs found. Backoff already clear.',
      })
    }

    const lines: string[] = []
    for (const job of retryable) {
      try {
        const { stdout: runOut } = await runOpenclaw(['cron', 'run', job.id])
        lines.push(`✅ ${job.id} retried`) 
        if (runOut.trim()) lines.push(runOut.trim())
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Retry failed'
        lines.push(`❌ ${job.id} retry failed: ${message}`)
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Retried ${retryable.length} errored job${retryable.length === 1 ? '' : 's'}.`,
      output: lines.join('\n'),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'command failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
