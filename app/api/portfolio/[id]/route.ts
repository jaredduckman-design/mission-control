import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { exportPortfolioToSource } from '../../../../lib/portfolio-sync'

type Payload = {
  ticker?: string
  name?: string
  category?: string
  notes?: string
  value?: number
  action?: 'buy' | 'sell' | 'note'
  amount?: number
  note?: string
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = await request.json().catch(() => null) as Payload | null
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const existing = await prisma.portfolioHolding.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Holding not found' }, { status: 404 })

  if (body.action === 'buy' || body.action === 'sell') {
    const action: 'buy' | 'sell' = body.action === 'buy' ? 'buy' : 'sell'
    const amount = Math.abs(Number(body.amount || 0))
    const signed = action === 'buy' ? amount : -amount
    const nextValue = Math.max(0, Number(existing.value) + signed)

    const updated = await prisma.$transaction(async (tx) => {
      const holding = await tx.portfolioHolding.update({
        where: { id },
        data: {
          value: nextValue,
          notes: body.note?.trim() ? [existing.notes, body.note.trim()].filter(Boolean).join('\n') : existing.notes,
        },
      })

      await tx.portfolioTrade.create({
        data: {
          holdingId: id,
          kind: action,
          amount,
          note: body.note?.trim() || null,
        },
      })

      return holding
    })

    await exportPortfolioToSource()
    return NextResponse.json({ holding: updated })
  }

  const updated = await prisma.portfolioHolding.update({
    where: { id },
    data: {
      ticker: body.ticker?.trim().toUpperCase() || existing.ticker,
      name: body.name?.trim() || existing.name,
      category: body.category?.trim() || existing.category,
      notes: body.notes !== undefined ? (body.notes?.trim() || null) : existing.notes,
      value: body.value !== undefined ? Math.max(0, Number(body.value || 0)) : existing.value,
    },
  })

  await exportPortfolioToSource()
  return NextResponse.json({ holding: updated })
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  await prisma.portfolioHolding.delete({ where: { id } })
  await exportPortfolioToSource()
  return NextResponse.json({ ok: true })
}
