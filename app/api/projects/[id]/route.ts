import { prisma } from '../../../../lib/prisma'

type Body = {
  name?: string
  description?: string
  status?: string
  owner?: string
  progress?: number
}

function sanitize(input: string) {
  return input.replace(/[\r\n]+/g, ' ').trim()
}

function normalizeProgress(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return undefined
  return Math.max(0, Math.min(100, Math.round(parsed)))
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = (await request.json()) as Body
    const { id } = await params

    const data = {
      name: typeof body.name === 'string' ? sanitize(body.name) : undefined,
      description: typeof body.description === 'string' ? sanitize(body.description) || null : undefined,
      status: typeof body.status === 'string' ? sanitize(body.status) : undefined,
      owner: typeof body.owner === 'string' ? sanitize(body.owner) : undefined,
      progress: normalizeProgress(body.progress),
    }

    await prisma.projectItem.update({
      where: { id },
      data,
    })

    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.projectItem.delete({ where: { id } })
    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
