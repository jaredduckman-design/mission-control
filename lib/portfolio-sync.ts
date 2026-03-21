import { promises as fs } from 'fs'
import path from 'path'
import { prisma } from './prisma'

export const PORTFOLIO_SOURCE = '/Users/jaredbot/.openclaw/workspace-warren/portfolio.json'

type SourceHolding = { ticker: string; name: string; value: number; weight?: number }
type SourcePortfolio = {
  lastUpdated?: string
  netWorth?: { investable?: number; property?: number; debt?: number }
  personal?: { total?: number; accounts?: Record<string, number>; holdings?: SourceHolding[] }
  business?: { total?: number; cash?: number; holdings?: SourceHolding[] }
}

function normalizeCategory(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes('cash')) return 'Cash'
  if (lower.includes('crypto') || lower === 'btc' || lower === 'eth') return 'Crypto'
  if (lower.includes('bank') || ['ry', 'td', 'bmo', 'na'].includes(lower)) return 'Banks'
  if (lower.includes('index') || lower.includes('etf') || ['xic', 'vfv', 'spy', 'qqq'].includes(lower)) return 'Indexes'
  return 'Stocks'
}

export async function syncPortfolioFromSourceIfNeeded() {
  let stat
  try {
    stat = await fs.stat(PORTFOLIO_SOURCE)
  } catch {
    return
  }

  const sourceMtimeMs = BigInt(Math.trunc(stat.mtimeMs))
  const meta = await prisma.portfolioMeta.findUnique({ where: { id: 1 } })

  if (meta && meta.sourceMtimeMs >= sourceMtimeMs) {
    return
  }

  const raw = await fs.readFile(PORTFOLIO_SOURCE, 'utf8')
  const source = JSON.parse(raw) as SourcePortfolio
  const personal = source.personal?.holdings ?? []
  const business = source.business?.holdings ?? []

  await prisma.$transaction(async (tx) => {
    await tx.portfolioTrade.deleteMany({})
    await tx.portfolioHolding.deleteMany({})

    for (const holding of personal) {
      await tx.portfolioHolding.create({
        data: {
          account: 'Personal',
          ticker: holding.ticker,
          name: holding.name,
          value: Number(holding.value || 0),
          category: normalizeCategory(holding.ticker || holding.name || 'Other'),
        },
      })
    }

    for (const holding of business) {
      await tx.portfolioHolding.create({
        data: {
          account: 'Business',
          ticker: holding.ticker,
          name: holding.name,
          value: Number(holding.value || 0),
          category: normalizeCategory(holding.ticker || holding.name || 'Other'),
        },
      })
    }

    await tx.portfolioMeta.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        investable: Number(source.netWorth?.investable || 0),
        property: Number(source.netWorth?.property || 0),
        debt: Number(source.netWorth?.debt || 0),
        sourceMtimeMs,
        sourceUpdatedAt: source.lastUpdated,
      },
      update: {
        investable: Number(source.netWorth?.investable || 0),
        property: Number(source.netWorth?.property || 0),
        debt: Number(source.netWorth?.debt || 0),
        sourceMtimeMs,
        sourceUpdatedAt: source.lastUpdated,
      },
    })
  })
}

export async function exportPortfolioToSource() {
  const [meta, holdings] = await Promise.all([
    prisma.portfolioMeta.findUnique({ where: { id: 1 } }),
    prisma.portfolioHolding.findMany({ orderBy: [{ account: 'asc' }, { value: 'desc' }] }),
  ])

  const personal = holdings.filter((h) => h.account === 'Personal')
  const business = holdings.filter((h) => h.account === 'Business')
  const personalTotal = personal.reduce((sum, h) => sum + h.value, 0)
  const businessTotal = business.reduce((sum, h) => sum + h.value, 0)

  const mapHolding = (h: (typeof holdings)[number], total: number) => ({
    ticker: h.ticker,
    name: h.name,
    value: Number(h.value.toFixed(2)),
    weight: total > 0 ? Number(((h.value / total) * 100).toFixed(1)) : 0,
  })

  const payload: SourcePortfolio = {
    lastUpdated: new Date().toISOString(),
    netWorth: {
      investable: Number((meta?.investable ?? personalTotal + businessTotal).toFixed(2)),
      property: Number((meta?.property ?? 0).toFixed(2)),
      debt: Number((meta?.debt ?? 0).toFixed(2)),
    },
    personal: {
      total: Number(personalTotal.toFixed(2)),
      accounts: {},
      holdings: personal.map((h) => mapHolding(h, personalTotal)),
    },
    business: {
      total: Number(businessTotal.toFixed(2)),
      cash: 0,
      holdings: business.map((h) => mapHolding(h, businessTotal)),
    },
  }

  await fs.mkdir(path.dirname(PORTFOLIO_SOURCE), { recursive: true })
  await fs.writeFile(PORTFOLIO_SOURCE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  const stat = await fs.stat(PORTFOLIO_SOURCE)

  await prisma.portfolioMeta.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      investable: Number(payload.netWorth?.investable || 0),
      property: Number(payload.netWorth?.property || 0),
      debt: Number(payload.netWorth?.debt || 0),
      sourceMtimeMs: BigInt(Math.trunc(stat.mtimeMs)),
      sourceUpdatedAt: payload.lastUpdated,
    },
    update: {
      investable: Number(payload.netWorth?.investable || 0),
      property: Number(payload.netWorth?.property || 0),
      debt: Number(payload.netWorth?.debt || 0),
      sourceMtimeMs: BigInt(Math.trunc(stat.mtimeMs)),
      sourceUpdatedAt: payload.lastUpdated,
    },
  })
}
