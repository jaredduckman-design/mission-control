import { prisma } from '../../../../lib/prisma'

type Body = {
  name?: string
  description?: string
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

    await prisma.projectItem.create({
      data: {
        name,
        description: description || null,
      },
    })

    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
