import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { name?: string; description?: string; owner?: string; status?: string; progress?: number }
    | null

  if (!body?.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const project = await prisma.projectItem.create({
    data: {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      owner: body.owner?.trim() || 'Hex',
      status: body.status?.trim() || 'Queued',
      progress: Number.isFinite(Number(body.progress)) ? Math.max(0, Math.min(100, Number(body.progress))) : 5,
    },
  })

  return NextResponse.json({ ok: true, project })
}
