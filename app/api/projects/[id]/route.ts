import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const body = (await request.json().catch(() => null)) as
    | { name?: string; description?: string; owner?: string; status?: string; progress?: number }
    | null

  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const existing = await prisma.projectItem.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const project = await prisma.projectItem.update({
    where: { id },
    data: {
      name: body.name?.trim(),
      description: body.description === undefined ? undefined : body.description.trim() || null,
      owner: body.owner?.trim(),
      status: body.status?.trim(),
      progress:
        body.progress === undefined
          ? undefined
          : Number.isFinite(Number(body.progress))
            ? Math.max(0, Math.min(100, Number(body.progress)))
            : existing.progress,
    },
  })

  return NextResponse.json({ ok: true, project })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params

  const existing = await prisma.projectItem.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  await prisma.projectItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
