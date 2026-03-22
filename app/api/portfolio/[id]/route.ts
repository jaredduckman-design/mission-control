import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { exportPortfolioToSource } from '../../../../lib/portfolio-sync'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const body = (await request.json().catch(() => null)) as
    | {
        ticker?: string
        name?: string
        category?: string
        value?: number
        notes?: string
        action?: 'buy' | 'sell'
        amount?: number
        note?: string
      }
    | null

  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const existing = await prisma.portfolioHolding.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Holding not found' }, { status: 404 })

  const shouldTrade = body.action === 'buy' || body.action === 'sell'

  if (shouldTrade) {
    const amount = Number(body.amount || 0)
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Trade amount must be greater than 0' }, { status: 400 })
    }

    const delta = body.action === 'buy' ? amount : -amount
    const updatedValue = Math.max(0, Number(existing.value || 0) + delta)

    const result = await prisma.$transaction(async (tx) => {
      const holding = await tx.portfolioHolding.update({ where: { id }, data: { value: updatedValue } })
      const trade = await tx.portfolioTrade.create({
        data: {
          holdingId: id,
          kind: body.action!,
          amount,
          note: body.note?.trim() || null,
        },
      })
      return { holding, trade }
    })

    await exportPortfolioToSource()
    return NextResponse.json({ ok: true, ...result })
  }

  const nextValue = body.value === undefined ? undefined : Number(body.value)
  if (nextValue !== undefined && !Number.isFinite(nextValue)) {
    return NextResponse.json({ error: 'value must be numeric' }, { status: 400 })
  }

  const holding = await prisma.portfolioHolding.update({
    where: { id },
    data: {
      ticker: body.ticker?.trim().toUpperCase(),
      name: body.name?.trim(),
      category: body.category?.trim(),
      value: nextValue,
      notes: body.notes !== undefined ? body.notes.trim() || null : undefined,
    },
  })

  await exportPortfolioToSource()
  return NextResponse.json({ ok: true, holding })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params

  const existing = await prisma.portfolioHolding.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Holding not found' }, { status: 404 })

  await prisma.portfolioHolding.delete({ where: { id } })
  await exportPortfolioToSource()

  return NextResponse.json({ ok: true })
}
