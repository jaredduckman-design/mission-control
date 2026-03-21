import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

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

  return NextResponse.json({ ok: true, settings })
}
