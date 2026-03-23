import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { execFile } from 'node:child_process'

const MORNING_JOB_ID = '8e3df657-8eda-4d91-9588-75f9937c9061'
const MORNING_BACKSTOP_ID = '107a11ac-5901-47ea-8a25-68e19d1fc546'
const WARREN_JOB_ID = '4463e3e4-fc59-4d69-8eb0-67b5fb87ab17'
const WARREN_BACKSTOP_ID = '457354c6-7104-4c78-88c7-f3833f5b69f4'

function toCronAt(hour24: number, minute: number) {
  return `${minute} ${hour24} * * *`
}

function addMinutes(hour24: number, minute: number, delta: number) {
  const total = hour24 * 60 + minute + delta
  const normalized = ((total % 1440) + 1440) % 1440
  return { hour24: Math.floor(normalized / 60), minute: normalized % 60 }
}

function parseHHMM(value: string) {
  const m = /^(\d{2}):(\d{2})$/.exec(value)
  if (!m) return null
  const hour24 = Number(m[1])
  const minute = Number(m[2])
  if (!Number.isInteger(hour24) || !Number.isInteger(minute) || hour24 < 0 || hour24 > 23 || minute < 0 || minute > 59) return null
  return { hour24, minute }
}

function runOpenclawCronEdit(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    execFile('openclaw', args, { timeout: 15000 }, (error) => {
      if (error) return reject(error)
      resolve()
    })
  })
}

async function applyScheduleChanges(morningBriefTime?: string, marketBriefTime?: string) {
  const updates: Promise<void>[] = []

  if (morningBriefTime) {
    const parsed = parseHHMM(morningBriefTime)
    if (parsed) {
      const backstop = addMinutes(parsed.hour24, parsed.minute, 15)
      updates.push(
        runOpenclawCronEdit(['cron', 'edit', MORNING_JOB_ID, '--cron', toCronAt(parsed.hour24, parsed.minute), '--tz', 'America/Toronto']),
        runOpenclawCronEdit(['cron', 'edit', MORNING_BACKSTOP_ID, '--cron', toCronAt(backstop.hour24, backstop.minute), '--tz', 'America/Toronto']),
      )
    }
  }

  if (marketBriefTime) {
    const parsed = parseHHMM(marketBriefTime)
    if (parsed) {
      const backstop = addMinutes(parsed.hour24, parsed.minute, 15)
      updates.push(
        runOpenclawCronEdit(['cron', 'edit', WARREN_JOB_ID, '--cron', toCronAt(parsed.hour24, parsed.minute), '--tz', 'America/Toronto']),
        runOpenclawCronEdit(['cron', 'edit', WARREN_BACKSTOP_ID, '--cron', toCronAt(backstop.hour24, backstop.minute), '--tz', 'America/Toronto']),
      )
    }
  }

  await Promise.allSettled(updates)
}

export async function GET() {
  const settings = await prisma.appSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } })
  return NextResponse.json({ settings })
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        selectedFrequency?: string
        morningBriefTime?: string
        marketBriefTime?: string
        modelOverrides?: Record<string, string>
      }
    | null

  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const modelOverrides = body.modelOverrides ?? {}
  const settings = await prisma.appSettings.upsert({
    where: { id: 1 },
    update: {
      selectedFrequency: body.selectedFrequency,
      morningBriefTime: body.morningBriefTime,
      marketBriefTime: body.marketBriefTime,
      modelKarl: modelOverrides.Karl,
      modelHex: modelOverrides.Hex,
      modelWarren: modelOverrides.Warren,
    },
    create: {
      id: 1,
      selectedFrequency: body.selectedFrequency ?? 'Every sprint',
      morningBriefTime: body.morningBriefTime ?? '07:00',
      marketBriefTime: body.marketBriefTime ?? '08:30',
      modelKarl: modelOverrides.Karl ?? 'gpt-5.3-codex',
      modelHex: modelOverrides.Hex ?? 'gpt-5.3-codex',
      modelWarren: modelOverrides.Warren ?? 'gpt-5.3-codex',
    },
  })

  await applyScheduleChanges(settings.morningBriefTime, settings.marketBriefTime)

  return NextResponse.json({ ok: true, settings })
}
