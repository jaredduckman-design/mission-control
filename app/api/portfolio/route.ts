import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { exportPortfolioToSource, syncPortfolioFromSourceIfNeeded } from '../../../lib/portfolio-sync'

export async function GET() {
  await syncPortfolioFromSourceIfNeeded()
  const holdings = await prisma.portfolioHolding.findMany({ orderBy: [{ account: 'asc' }, { value: 'desc' }] })
  return NextResponse.json({ holdings })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as
    | { account?: string; ticker?: string; name?: string; value?: number; category?: string; notes?: string }
    | null

  if (!body?.ticker || !body?.name || !body?.account) {
    return NextResponse.json({ error: 'account, ticker, and name are required' }, { status: 400 })
  }

  const value = Number(body.value || 0)
  const holding = await prisma.portfolioHolding.create({
    data: {
      account: body.account === 'Business' ? 'Business' : 'Personal',
      ticker: body.ticker.trim().toUpperCase(),
      name: body.name.trim(),
      value: Number.isFinite(value) ? value : 0,
      category: body.category?.trim() || 'Other',
      notes: body.notes?.trim() || null,
    },
  })

  await exportPortfolioToSource()
  return NextResponse.json({ holding })
}
