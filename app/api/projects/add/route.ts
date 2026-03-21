import { promises as fs } from 'fs'

const CURRENT_TASK_PATH = '/Users/jaredbot/.openclaw/workspace-hex/CURRENT_TASK.md'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; description?: string }
    const name = body.name?.trim()
    const description = body.description?.trim() || 'No description provided.'

    if (!name) {
      return Response.json({ error: 'Project name is required.' }, { status: 400 })
    }

    const line = `\n- [PROJECT IDEA] ${name} — ${description} (captured from Mission Control)`
    await fs.appendFile(CURRENT_TASK_PATH, line, 'utf8')

    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
