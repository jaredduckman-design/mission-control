'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { MissionControlData } from '../lib/mission-control-data'

type WorldViewProps = {
  world: MissionControlData['world']
}

type Walker = {
  name: string
  emoji: string
  status: string
  task: string
  from: { x: number; y: number; label: string }
  to: { x: number; y: number; label: string }
  pace: 'fast' | 'slow'
  progress: number
  direction: 1 | -1
}

const COLOR_MAP: Record<string, string> = {
  Karl: '#ef4444',
  Hex: '#22c55e',
  Warren: '#f59e0b',
  Scout: '#3b82f6',
  Quill: '#a855f7',
}

const WORLD_WIDTH = 820
const WORLD_HEIGHT = 560

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function makePixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, pixel = 4) {
  ctx.fillStyle = color
  for (let px = x; px < x + w; px += pixel) {
    for (let py = y; py < y + h; py += pixel) {
      ctx.fillRect(px, py, pixel, pixel)
    }
  }
}

function wrapBubbleText(text: string, maxChars = 34, maxLines = 2) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars) {
      current = candidate
      return
    }

    if (current) lines.push(current)
    current = word
  })

  if (current) lines.push(current)

  if (lines.length <= maxLines) return lines
  const limited = lines.slice(0, maxLines)
  limited[maxLines - 1] = `${limited[maxLines - 1].slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`
  return limited
}

export function WorldView({ world }: WorldViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const loopRef = useRef<number | null>(null)
  const [musicOn, setMusicOn] = useState(false)
  const [torontoHour, setTorontoHour] = useState(world.localHourToronto)

  const walkersRef = useRef<Walker[]>([])

  const landmarks = useMemo(
    () => ({
      Karl: [
        { x: 130, y: 140, label: 'Desk' },
        { x: 320, y: 145, label: 'Mailbox' },
      ],
      Hex: [
        { x: 430, y: 165, label: 'Computer' },
        { x: 610, y: 165, label: 'GitHub Sign' },
      ],
      Warren: [
        { x: 120, y: 315, label: 'Stock Ticker' },
        { x: 305, y: 315, label: 'Safe' },
      ],
      Scout: [
        { x: 430, y: 315, label: 'Library' },
        { x: 610, y: 315, label: 'Magnifier' },
      ],
      Quill: [
        { x: 260, y: 465, label: 'Typewriter' },
        { x: 510, y: 465, label: 'Scroll' },
      ],
    }),
    [],
  )

  useEffect(() => {
    walkersRef.current = world.agents.map((agent, idx) => ({
      name: agent.name,
      emoji: agent.emoji,
      status: agent.status,
      task: agent.currentTask,
      from: landmarks[agent.name][0],
      to: landmarks[agent.name][1],
      pace: agent.pace,
      progress: (idx * 0.17) % 1,
      direction: idx % 2 === 0 ? 1 : -1,
    }))
  }, [landmarks, world.agents])

  useEffect(() => {
    const getTorontoHour = () => {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        hour: '2-digit',
        hour12: false,
        timeZone: 'America/Toronto',
      })
      const hourValue = Number.parseInt(formatter.format(new Date()), 10)
      return Number.isNaN(hourValue) ? world.localHourToronto : hourValue
    }

    setTorontoHour(getTorontoHour())
    const timer = window.setInterval(() => {
      setTorontoHour(getTorontoHour())
    }, 60_000)

    return () => window.clearInterval(timer)
  }, [world.localHourToronto])

  useEffect(() => {
    if (!musicOn) {
      if (loopRef.current) {
        window.clearInterval(loopRef.current)
        loopRef.current = null
      }
      if (audioRef.current) {
        audioRef.current.close().catch(() => undefined)
        audioRef.current = null
      }
      return
    }

    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return

    const audio = new AudioCtx()
    audioRef.current = audio

    const notes = [523.25, 659.25, 783.99, 659.25, 523.25, 392.0, 523.25, 659.25]
    let step = 0

    const playStep = () => {
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.type = 'square'
      osc.frequency.value = notes[step % notes.length]

      gain.gain.setValueAtTime(0.0001, audio.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.04, audio.currentTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.23)

      osc.connect(gain)
      gain.connect(audio.destination)
      osc.start()
      osc.stop(audio.currentTime + 0.24)

      step += 1
    }

    if (audio.state === 'suspended') {
      audio.resume().catch(() => undefined)
    }

    playStep()
    loopRef.current = window.setInterval(playStep, 260)

    return () => {
      if (loopRef.current) {
        window.clearInterval(loopRef.current)
        loopRef.current = null
      }
      audio.close().catch(() => undefined)
      if (audioRef.current === audio) audioRef.current = null
    }
  }, [musicOn])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let previous = performance.now()

    const draw = (now: number) => {
      const dt = (now - previous) / 1000
      previous = now

      const dpr = window.devicePixelRatio || 1
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const isNight = torontoHour >= 19 || torontoHour < 7
      const sky = isNight ? '#0a1024' : '#7ec8ff'
      const ground = isNight ? '#102335' : '#2c7b4d'

      const scale = Math.min(width / WORLD_WIDTH, height / WORLD_HEIGHT)
      const offsetX = (width - WORLD_WIDTH * scale) / 2
      const offsetY = (height - WORLD_HEIGHT * scale) / 2

      ctx.fillStyle = '#060b16'
      ctx.fillRect(0, 0, width, height)
      ctx.save()
      ctx.translate(offsetX, offsetY)
      ctx.scale(scale, scale)

      ctx.fillStyle = sky
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
      ctx.fillStyle = ground
      ctx.fillRect(0, WORLD_HEIGHT * 0.34, WORLD_WIDTH, WORLD_HEIGHT * 0.66)

      if (isNight) {
        for (let i = 0; i < 40; i += 1) {
          ctx.fillStyle = i % 2 === 0 ? '#fef3c7' : '#dbeafe'
          ctx.fillRect((i * 57) % WORLD_WIDTH, 20 + ((i * 31) % 120), 2, 2)
        }
      } else {
        ctx.fillStyle = '#fde047'
        ctx.beginPath()
        ctx.arc(WORLD_WIDTH - 70, 70, 30, 0, Math.PI * 2)
        ctx.fill()
      }

      const buildings = [
        { x: 70, y: 90, w: 120, h: 90, label: 'HQ', color: '#1e3a8a' },
        { x: 250, y: 95, w: 120, h: 85, label: 'Lab', color: '#065f46' },
        { x: 430, y: 85, w: 120, h: 95, label: 'Bank', color: '#78350f' },
        { x: 610, y: 90, w: 120, h: 90, label: 'Library', color: '#3f3f46' },
        { x: 330, y: 380, w: 140, h: 95, label: 'Studio', color: '#581c87' },
      ]

      buildings.forEach((building) => {
        makePixelRect(ctx, building.x, building.y, building.w, building.h, building.color)
        makePixelRect(ctx, building.x + 8, building.y + 8, building.w - 16, 16, '#f8fafc')
        ctx.fillStyle = '#0b1220'
        ctx.font = 'bold 12px monospace'
        ctx.fillText(building.label, building.x + 12, building.y + 20)
      })

      walkersRef.current.forEach((walker) => {
        const speed = walker.pace === 'fast' ? 0.23 : 0.11
        walker.progress += speed * dt * walker.direction

        if (walker.progress >= 1) {
          walker.progress = 1
          walker.direction = -1
        } else if (walker.progress <= 0) {
          walker.progress = 0
          walker.direction = 1
        }

        const x = walker.from.x + (walker.to.x - walker.from.x) * walker.progress
        const y = walker.from.y + (walker.to.y - walker.from.y) * walker.progress

        const bubbleText = `${walker.name} (${walker.status}): ${walker.task}`
        const bubbleLines = wrapBubbleText(bubbleText, 34, 2)
        const bubbleWidth = clamp(Math.max(170, Math.max(...bubbleLines.map((line) => line.length)) * 6.5), 170, 300)
        const bubbleHeight = bubbleLines.length > 1 ? 38 : 26
        const bubbleY = y - (bubbleLines.length > 1 ? 70 : 58)
        const bubbleX = clamp(x - bubbleWidth / 2, 8, WORLD_WIDTH - bubbleWidth - 8)

        makePixelRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 'rgba(15,23,42,0.95)', 2)
        makePixelRect(ctx, bubbleX, bubbleY, bubbleWidth, 2, '#f8fafc', 2)
        makePixelRect(ctx, clamp(x - 2, 8, WORLD_WIDTH - 10), bubbleY + bubbleHeight - 6, 8, 8, 'rgba(15,23,42,0.95)', 2)

        ctx.fillStyle = '#e2e8f0'
        ctx.font = '11px monospace'
        bubbleLines.forEach((line, lineIndex) => {
          ctx.fillText(line, bubbleX + 6, bubbleY + 18 + lineIndex * 12)
        })

        makePixelRect(ctx, x - 9, y - 10, 18, 18, COLOR_MAP[walker.name] ?? '#94a3b8')
        ctx.fillStyle = '#020617'
        ctx.font = '14px serif'
        ctx.fillText(walker.emoji, x - 7, y + 4)

        ctx.fillStyle = '#f8fafc'
        ctx.font = '10px monospace'
        ctx.fillText(`${walker.from.label} ↔ ${walker.to.label}`, clamp(x - 52, 8, WORLD_WIDTH - 130), y + 24)
      })

      ctx.restore()
      raf = window.requestAnimationFrame(draw)
    }

    raf = window.requestAnimationFrame(draw)
    return () => window.cancelAnimationFrame(raf)
  }, [torontoHour])

  return (
    <section className="space-y-4" title="World view gives a live pixel-town snapshot of each agent moving between landmarks.">
      <article className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Page 06 · World</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Pixel Agent Town</h3>
            <p className="mt-2 text-sm text-slate-300">Toronto local time: {String(torontoHour).padStart(2, '0')}:00 · {torontoHour >= 19 || torontoHour < 7 ? 'Night cycle' : 'Day cycle'}</p>
          </div>
          <button
            type="button"
            onClick={() => setMusicOn((prev) => !prev)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold ${musicOn ? 'border-emerald-300/40 bg-emerald-300/20 text-emerald-100' : 'border-white/10 bg-white/[0.04] text-slate-200'}`}
          >
            8-bit music {musicOn ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#060b16]">
          <canvas ref={canvasRef} className="h-[360px] w-full sm:h-[480px] lg:h-[560px]" aria-label="Pixel world with moving agents and speech bubbles" />
        </div>
      </article>
    </section>
  )
}
