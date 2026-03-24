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
  statusDot: 'green' | 'amber' | 'red' | 'gray'
  warning: boolean
  sad: boolean
  lastActiveMinutes: number | null
  queueCount: number
  lastPosition: { x: number; y: number } | null
  stuckForSeconds: number
}

const COLOR_MAP: Record<string, string> = {
  Karl: '#ef4444',
  Hex: '#22c55e',
  Warren: '#f59e0b',
  Scout: '#3b82f6',
  Quill: '#a855f7',
}

const DOT_COLOR: Record<Walker['statusDot'], string> = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
  gray: '#94a3b8',
}

const BUILDING_BY_AGENT: Record<string, string> = {
  Karl: 'HQ',
  Hex: 'Lab',
  Warren: 'Bank',
  Scout: 'Library',
  Quill: 'Studio',
}

const BUILDING_GLOW_COLOR: Record<string, string> = {
  HQ: '239,68,68',
  Lab: '34,197,94',
  Bank: '245,158,11',
  Library: '59,130,246',
  Studio: '168,85,247',
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

function formatLastActive(minutes: number | null) {
  if (minutes === null) return 'No recent run'
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  return rem ? `${hours}h ${rem}m ago` : `${hours}h ago`
}

function truncateTask(task: string, max = 24) {
  if (task.length <= max) return task
  return `${task.slice(0, Math.max(0, max - 1)).trimEnd()}…`
}

export function WorldView({ world }: WorldViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const loopRef = useRef<number | null>(null)
  const [musicOn, setMusicOn] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
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

  const worldData = useMemo(() => {
    if (!demoMode) return world

    return {
      ...world,
      agents: world.agents.map((agent) => ({
        ...agent,
        status: 'Working',
        currentTask: `Demo mode: ${agent.name} running showcase workflow`,
        pace: 'fast' as const,
        statusDot: 'green' as const,
        warning: false,
        sad: false,
        lastActiveMinutes: 1,
        queueCount: Math.max(2, agent.queueCount),
      })),
      health: {
        totalAgents: world.health.totalAgents,
        activeNow: world.health.totalAgents,
        blocked: 0,
        state: 'All clear ✅' as const,
        tone: 'green' as const,
      },
      ticker: world.agents.map((agent, idx) => `${agent.name} demo pipeline active · ${idx + 1}m ago`).slice(0, 5),
    }
  }, [demoMode, world])

  useEffect(() => {
    walkersRef.current = worldData.agents.map((agent, idx) => ({
      name: agent.name,
      emoji: agent.emoji,
      status: agent.status,
      task: agent.currentTask,
      from: landmarks[agent.name][0],
      to: landmarks[agent.name][1],
      pace: agent.pace,
      progress: (idx * 0.17) % 1,
      direction: idx % 2 === 0 ? 1 : -1,
      statusDot: agent.statusDot,
      warning: agent.warning,
      sad: agent.sad,
      lastActiveMinutes: agent.lastActiveMinutes,
      queueCount: agent.queueCount,
      lastPosition: null,
      stuckForSeconds: 0,
    }))
  }, [landmarks, worldData.agents])

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

    if (audio.state === 'suspended') audio.resume().catch(() => undefined)
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
      const celestialX = ((now / 1000) * 6) % (WORLD_WIDTH + 180) - 90

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
        for (let i = 0; i < 36; i += 1) {
          const starX = ((i * 47) + (now / 80) * (i % 3 === 0 ? 1 : -0.6)) % WORLD_WIDTH
          const starY = 20 + ((i * 29) % 120)
          ctx.fillStyle = i % 2 === 0 ? '#fef3c7' : '#dbeafe'
          ctx.fillRect(starX, starY, 2, 2)
        }
        ctx.fillStyle = '#e5e7eb'
        ctx.beginPath()
        ctx.arc(celestialX, 72, 26, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillStyle = '#fde047'
        ctx.beginPath()
        ctx.arc(celestialX, 72, 30, 0, Math.PI * 2)
        ctx.fill()
      }

      const activeNames = new Set(walkersRef.current.filter((walker) => walker.statusDot === 'green').map((walker) => walker.name))

      const buildings = [
        { x: 70, y: 90, w: 120, h: 90, label: 'HQ', color: '#1e3a8a' },
        { x: 250, y: 95, w: 120, h: 85, label: 'Lab', color: '#065f46' },
        { x: 430, y: 85, w: 120, h: 95, label: 'Bank', color: '#78350f' },
        { x: 610, y: 90, w: 120, h: 90, label: 'Library', color: '#3f3f46' },
        { x: 330, y: 380, w: 140, h: 95, label: 'Studio', color: '#581c87' },
      ]

      buildings.forEach((building) => {
        const activeAgent = walkersRef.current.find((walker) => BUILDING_BY_AGENT[walker.name] === building.label)
        const isBuildingActive = activeAgent ? activeNames.has(activeAgent.name) : false
        makePixelRect(ctx, building.x, building.y, building.w, building.h, building.color)
        if (isBuildingActive) {
          const pulse = 0.2 + Math.abs(Math.sin(now / 380)) * 0.25
          const glowRgb = BUILDING_GLOW_COLOR[building.label] ?? '255,255,255'
          makePixelRect(ctx, building.x - 4, building.y - 4, building.w + 8, 6, `rgba(${glowRgb},${pulse})`, 2)
        }
        makePixelRect(ctx, building.x + 8, building.y + 8, building.w - 16, 16, '#f8fafc')
        ctx.fillStyle = '#0b1220'
        ctx.font = 'bold 12px monospace'
        ctx.fillText(building.label, building.x + 12, building.y + 20)
      })

      walkersRef.current.forEach((walker) => {
        const speed = walker.pace === 'fast' ? 0.23 : 0

        if (!Number.isFinite(walker.progress)) {
          walker.progress = 0.5
          walker.direction = 1
          walker.stuckForSeconds = 0
          walker.lastPosition = null
        }

        walker.progress += speed * dt * walker.direction

        if (walker.progress >= 1) {
          walker.progress = 1
          walker.direction = -1
        } else if (walker.progress <= 0) {
          walker.progress = 0
          walker.direction = 1
        }

        let baseX = walker.from.x + (walker.to.x - walker.from.x) * walker.progress
        let baseY = walker.from.y + (walker.to.y - walker.from.y) * walker.progress

        if (walker.pace === 'fast') {
          if (walker.lastPosition) {
            const moved = Math.hypot(baseX - walker.lastPosition.x, baseY - walker.lastPosition.y)
            if (moved < 0.06) {
              walker.stuckForSeconds += dt
            } else {
              walker.stuckForSeconds = Math.max(0, walker.stuckForSeconds - dt * 2)
            }

            if (walker.stuckForSeconds > 1.2) {
              walker.direction = walker.direction === 1 ? -1 : 1
              walker.progress = clamp(walker.progress + 0.08 * walker.direction, 0, 1)
              baseX = walker.from.x + (walker.to.x - walker.from.x) * walker.progress
              baseY = walker.from.y + (walker.to.y - walker.from.y) * walker.progress
              walker.stuckForSeconds = 0
            }
          }

          walker.lastPosition = { x: baseX, y: baseY }
        } else {
          walker.lastPosition = null
          walker.stuckForSeconds = 0
        }
        const stuckShake = walker.sad ? Math.sin(now / 90) * 1.8 : 0
        const stuckBob = walker.sad ? Math.sin(now / 140) * 0.6 : 0
        const x = baseX + stuckShake
        const y = baseY + stuckBob

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

        const statsY = bubbleY + bubbleHeight + 10
        const statsWidth = clamp(bubbleWidth, 190, 240)
        const statsX = clamp(x - statsWidth / 2, 8, WORLD_WIDTH - statsWidth - 8)
        const statsTask = truncateTask(walker.task, 26)
        makePixelRect(ctx, statsX, statsY, statsWidth, 52, 'rgba(2,6,23,0.92)', 2)
        makePixelRect(ctx, statsX, statsY, statsWidth, 2, 'rgba(148,163,184,0.9)', 2)
        ctx.fillStyle = '#cbd5e1'
        ctx.font = '9px monospace'
        ctx.fillText(`Last active: ${formatLastActive(walker.lastActiveMinutes)}`, statsX + 6, statsY + 12)
        ctx.fillText(`Last task: ${statsTask}`, statsX + 6, statsY + 23)
        ctx.fillText(`Status: ${walker.status}`, statsX + 6, statsY + 34)
        ctx.fillText(`Tasks in queue: ${walker.queueCount}`, statsX + 6, statsY + 45)

        if (walker.warning) {
          ctx.fillStyle = '#ef4444'
          ctx.font = '16px monospace'
          ctx.fillText('⚠', x - 6, y - 28)
        }

        ctx.fillStyle = DOT_COLOR[walker.statusDot]
        const pulseSize = walker.statusDot === 'green' ? 4 + Math.abs(Math.sin(now / 180)) * 2 : 4
        ctx.beginPath()
        ctx.arc(x, y - 24, pulseSize, 0, Math.PI * 2)
        ctx.fill()

        makePixelRect(ctx, x - 9, y - 10, 18, 18, COLOR_MAP[walker.name] ?? '#94a3b8')
        ctx.fillStyle = '#020617'
        ctx.font = '14px serif'
        ctx.fillText(walker.sad ? '☹' : walker.emoji, x - 7, y + 4)

        if (walker.sad) {
          const lockPulse = 0.25 + Math.abs(Math.sin(now / 210)) * 0.45
          makePixelRect(ctx, x - 12, y + 11, 24, 3, `rgba(239,68,68,${lockPulse})`, 1)
          ctx.fillStyle = '#fca5a5'
          ctx.font = '10px monospace'
          ctx.fillText('STUCK', x - 15, y - 16)
        }

        if (walker.statusDot === 'green') {
          for (let i = 0; i < 3; i += 1) {
            ctx.fillStyle = '#fef08a'
            ctx.fillRect(x + 12 + i * 3, y - 6 + ((now / 120 + i) % 8), 2, 2)
          }
        }

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

  const tickerText = worldData.ticker.length ? worldData.ticker.join('  |  ') : 'No recent cross-agent events available yet.'

  return (
    <section className="space-y-4" title="World view gives a live pixel-town snapshot of each agent moving between landmarks.">
      <article className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Page 06 · World</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Pixel Agent Town</h3>
            <p className="mt-2 text-sm text-slate-300">Toronto local time: {String(torontoHour).padStart(2, '0')}:00 · {torontoHour >= 19 || torontoHour < 7 ? 'Night cycle' : 'Day cycle'}</p>
            {demoMode ? <p className="mt-1 text-xs font-medium text-amber-200">Demo mode is active · all agents are shown as working with synthetic task labels.</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDemoMode((prev) => !prev)}
              aria-label="Toggle Demo Mode"
              className={`rounded-xl border px-3 py-2 text-xs font-semibold ${demoMode ? 'border-amber-300/40 bg-amber-300/20 text-amber-100' : 'border-white/10 bg-white/[0.04] text-slate-200'}`}
            >
              Demo Mode {demoMode ? 'ON' : 'OFF'}
            </button>
            <button
              type="button"
              onClick={() => setMusicOn((prev) => !prev)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold ${musicOn ? 'border-emerald-300/40 bg-emerald-300/20 text-emerald-100' : 'border-white/10 bg-white/[0.04] text-slate-200'}`}
            >
              8-bit music {musicOn ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div
          className={`mt-4 grid gap-3 rounded-2xl border px-4 py-3 text-xs sm:grid-cols-4 ${
            worldData.health.tone === 'red'
              ? 'border-red-300/30 bg-red-500/10 text-red-100'
              : worldData.health.tone === 'amber'
                ? 'border-amber-300/30 bg-amber-500/10 text-amber-100'
                : 'border-emerald-300/30 bg-emerald-500/10 text-emerald-100'
          }`}
        >
          <p>Total agents: <span className="font-semibold">{worldData.health.totalAgents}</span></p>
          <p>Active now: <span className="font-semibold">{worldData.health.activeNow}</span></p>
          <p>Blocked: <span className="font-semibold">{worldData.health.blocked}</span></p>
          <p>Overall state: <span className="font-semibold">{worldData.health.state}</span></p>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#060b16]">
          <canvas ref={canvasRef} className="h-[360px] w-full sm:h-[480px] lg:h-[560px]" aria-label="Pixel world with moving agents and speech bubbles" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {worldData.agents.map((agent) => (
            <article key={agent.name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-slate-200">
              <p className="flex items-center gap-2 font-semibold text-white">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DOT_COLOR[agent.statusDot] }} />
                {agent.name}
                {agent.warning ? <span className="text-red-300">⚠</span> : null}
              </p>
              <p className="mt-2 text-slate-300">Last active: {formatLastActive(agent.lastActiveMinutes)}</p>
              <p className="mt-1 truncate text-slate-300" title={agent.currentTask}>Last task: {agent.currentTask}</p>
              <p className="mt-1 text-slate-300">Status: {agent.status}</p>
              <p className="mt-1 text-slate-300">Tasks in queue: {agent.queueCount}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#050a14] py-2">
          <div className="whitespace-nowrap text-xs text-cyan-100 animate-[marquee_25s_linear_infinite] px-3">{tickerText}</div>
        </div>
      </article>
    </section>
  )
}
