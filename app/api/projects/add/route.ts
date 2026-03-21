import { promises as fs } from 'fs'
import path from 'path'

const CURRENT_TASK_PATH = '/Users/jaredbot/.openclaw/workspace-hex/CURRENT_TASK.md'

type Body = {
  name?: string
  description?: string
}

function nowLabel() {
  return new Date().toLocaleString('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: false,
    timeZone: 'America/Toronto',
  })
}

function sanitize(input: string) {
  return input.replace(/[\r\n]+/g, ' ').trim()
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body
    const name = sanitize(body.name ?? '')
    const description = sanitize(body.description ?? '')

    if (!name) {
      return Response.json({ ok: false, error: 'Project name is required.' }, { status: 400 })
    }

    const line = `- [ ] ${name}${description ? ` — ${description}` : ''} _(added ${nowLabel()})_`

    let source = ''
    try {
      source = await fs.readFile(CURRENT_TASK_PATH, 'utf8')
    } catch {
      source = '# CURRENT_TASK\n\n'
    }

    let next = source
    if (source.includes('## Project Intake')) {
      next = source.replace(/## Project Intake\n([\s\S]*?)(\n## |$)/, (match, sectionBody, boundary) => {
        const trimmed = String(sectionBody ?? '').trimEnd()
        const content = trimmed ? `${trimmed}\n${line}\n` : `\n${line}\n`
        return `## Project Intake\n${content}${boundary}`
      })
    } else {
      const suffix = source.endsWith('\n') ? '' : '\n'
      next = `${source}${suffix}\n## Project Intake\n${line}\n`
    }

    await fs.mkdir(path.dirname(CURRENT_TASK_PATH), { recursive: true })
    await fs.writeFile(CURRENT_TASK_PATH, next, 'utf8')

    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
