'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useRouter } from 'next/navigation'
import type { MissionControlData } from '../lib/mission-control-data'
import { WorldView } from './world-view'

const navItems = ['Overview', 'Schedule', 'Agents', 'Approvals', 'Portfolio', 'Projects', 'World', 'Memory', 'Documents', 'System', 'Settings'] as const

const NAV_OWNER: Record<(typeof navItems)[number], AgentName> = {
  Overview: 'Karl',
  Schedule: 'Karl',
  Agents: 'Karl',
  Approvals: 'Karl',
  Portfolio: 'Warren',
  Projects: 'Hex',
  World: 'Karl',
  Memory: 'Karl',
  Documents: 'Hex',
  System: 'Karl',
  Settings: 'Karl',
}

const NAV_TOOLTIPS: Record<(typeof navItems)[number], string> = {
  Overview: 'Quickly answers what is happening right now and what needs attention first.',
  Schedule: 'Shows when background jobs run so you can predict workload and timing.',
  Agents: 'Explains who each agent is, what they own, and whether they are healthy or blocked.',
  Approvals: 'Queues decisions and sign-offs so blocked work gets cleared quickly.',
  Portfolio: 'Summarizes money posture and risk in simple percentages and holdings.',
  Projects: 'Tracks delivery progress, recent commits, and blockers for active work.',
  World: 'Pixel-town map showing where each agent is moving and what task they are actively handling.',
  Memory: 'Surfaces prior notes and logs so decisions have context and continuity.',
  Documents: 'Lists core project docs and opens them directly so context is one click away.',
  System: 'Shows runtime reliability, cron health, and operational warnings.',
  Settings: 'Controls update cadence, model routing, and notification delivery.',
}

type View = (typeof navItems)[number]

type AgentName = 'Karl' | 'Hex' | 'Warren' | 'Scout' | 'Quill'

const AGENT_THEME: Record<AgentName, { color: string; emoji: string; tagline: string }> = {
  Karl: { color: '#ef4444', emoji: '🦞', tagline: 'Your AI chief of staff' },
  Hex: { color: '#00ff88', emoji: '💻', tagline: 'Builds while you sleep' },
  Warren: { color: '#f59e0b', emoji: '💰', tagline: 'Watches your money' },
  Scout: { color: '#3b82f6', emoji: '🛰️', tagline: 'Finds signal before noise' },
  Quill: { color: '#a855f7', emoji: '✍️', tagline: 'Writes clear updates fast' },
}

function toneClasses(tone: 'violet' | 'cyan' | 'emerald' | 'amber') {
  switch (tone) {
    case 'cyan':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
    case 'violet':
      return 'border-violet-400/20 bg-violet-400/10 text-violet-100'
    case 'emerald':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
    case 'amber':
      return 'border-amber-300/20 bg-amber-300/10 text-amber-100'
  }
}

function agentTheme(name: string) {
  return AGENT_THEME[name as AgentName] ?? { color: '#94a3b8', emoji: '🤖', tagline: 'Autonomous operator' }
}

function statusBadgeClass(status: string) {
  const normalized = status.toUpperCase()
  if (normalized === 'RUNNING') return 'bg-[#00ff88] text-black border-[#00ff88]'
  if (normalized === 'BLOCKED') return 'bg-[#ef4444] text-white border-[#ef4444]'
  if (normalized === 'HEALTHY') return 'bg-emerald-500 text-white border-emerald-400'
  if (normalized === 'COORDINATING') return 'bg-blue-500 text-white border-blue-400'
  if (normalized === 'SHIPPING') return 'bg-emerald-500 text-white border-emerald-400'
  if (normalized === 'MONITORING') return 'bg-amber-400 text-slate-950 border-amber-300'
  return 'bg-white/10 text-white border-white/20'
}

function projectStatusBadgeClass(status: string) {
  const normalized = status.toUpperCase()
  if (normalized.includes('BLOCK')) return statusBadgeClass('BLOCKED')
  if (normalized.includes('COMPLETE') || normalized.includes('DONE')) return statusBadgeClass('HEALTHY')
  if (normalized.includes('SHIP') || normalized.includes('PROGRESS') || normalized.includes('ACTIVE')) return statusBadgeClass('SHIPPING')
  if (normalized.includes('MONITOR')) return statusBadgeClass('MONITORING')
  return statusBadgeClass(status)
}

function SectionHint({ text }: { text: string }) {
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-xs font-bold text-cyan-100"
      title={text}
      aria-label={text}
    >
      ?
    </span>
  )
}

export function MissionControlDashboard({ data }: { data: MissionControlData }) {
  const router = useRouter()
  const [activeView, setActiveView] = useState<View>('Overview')
  const [lastLiveSyncAt, setLastLiveSyncAt] = useState<Date>(new Date())

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh()
      setLastLiveSyncAt(new Date())
    }, 30000)

    return () => window.clearInterval(interval)
  }, [router])

  const liveSyncLabel = useMemo(
    () => lastLiveSyncAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }),
    [lastLiveSyncAt],
  )

  const heading = useMemo(() => {
    switch (activeView) {
      case 'Schedule':
        return {
          eyebrow: 'Weekly schedule',
          title: 'A clean calendar view for recurring operating rhythm.',
          description: 'This is the heartbeat layer: what should happen each day, when proof is expected, and where the team shifts gears.',
        }
      case 'Agents':
        return {
          eyebrow: 'Agent ops',
          title: 'Live ownership, recent motion, and confidence by agent.',
          description: 'Karl keeps the routing tight, Hex ships the product, and Warren watches the operational edge cases.',
        }
      case 'Approvals':
        return {
          eyebrow: 'Approvals queue',
          title: 'Decision requests that need a quick yes/no to unblock delivery.',
          description: 'This view consolidates blockers from projects, system warnings, and agent handoffs into one clean queue.',
        }
      case 'Portfolio':
        return {
          eyebrow: 'Portfolio',
          title: 'DB-backed holdings, account values, and net worth in one place.',
          description: 'Use this view to add or edit positions, log buys and sells, and keep Warren’s source file synced automatically.',
        }
      case 'Projects':
        return {
          eyebrow: 'Project board',
          title: 'A concise scan of what is moving across the workspace.',
          description: 'This page keeps project status visible without dropping into chat or opening five folders.',
        }
      case 'World':
        return {
          eyebrow: 'World view',
          title: 'A retro 16-bit town where each agent moves between live work landmarks.',
          description: 'Use this page to see who is actively moving, what task they are on, and whether the city is in day or night mode.',
        }
      case 'Memory':
        return {
          eyebrow: 'Memory feed',
          title: 'Recent notes pulled from the real workspace memory folder.',
          description: 'The point here is continuity: quick summaries of what the system has already learned or recorded.',
        }
      case 'Documents':
        return {
          eyebrow: 'Documents',
          title: 'Core project docs and references in one place.',
          description: 'Use this view to jump straight into task briefs, readmes, and memory sources without hunting through folders.',
        }
      case 'System':
        return {
          eyebrow: 'System snapshot',
          title: 'Runtime health, data sources, and deployment readiness.',
          description: 'This page turns the app into an actual control surface instead of a pretty shell.',
        }
      case 'Settings':
        return {
          eyebrow: 'Settings',
          title: 'Control cadence, model overrides, and notification routing.',
          description: 'This page keeps cadence, model routing, and notifications clear in plain language.',
        }
      default:
        return {
          eyebrow: 'Overview',
          title: 'Mission Control now looks like an execution dashboard, not a placeholder.',
          description: 'Dark, premium, and tuned for seeing what matters fast: agents, schedule, project motion, memory, and system state.',
        }
    }
  }, [activeView])

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-5 text-slate-100 lg:px-6 lg:py-6">
      <div className="mx-auto grid max-w-[1680px] gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-[32px] border border-white/8 bg-[#091122]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(14,23,45,0.98),rgba(10,16,29,0.92))] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.8),rgba(59,130,246,0.2)),linear-gradient(145deg,#0f172a,#172554)] text-sm font-semibold tracking-[0.24em] text-white">
                MC
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Mission Control</p>
                <h1 className="mt-1 text-lg font-semibold text-white">Operations dashboard</h1>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Milestone 1</p>
              <p className="mt-2 text-xl font-semibold text-white">{data.overview.completion}</p>
              <p className="mt-3 truncate text-sm text-slate-300" title={`Generated from local workspace context at ${data.generatedLabel}.`}>Generated from local workspace context at {data.generatedLabel}.</p>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Command deck</p>
            <p className="mt-3 truncate text-sm text-slate-200" title={data.commandDeck.focus}>{data.commandDeck.focus}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/8 bg-[#070c17] px-3 py-2">
                <p className="text-slate-500">Active day</p>
                <p className="mt-1 font-semibold text-white">{data.commandDeck.activeDay}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[#070c17] px-3 py-2">
                <p className="text-slate-500">Memory notes</p>
                <p className="mt-1 font-semibold text-white">{data.commandDeck.memoryCount}</p>
              </div>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item, index) => {
              const active = item === activeView
              const dotColor = AGENT_THEME[NAV_OWNER[item]].color
              return (
                <button
                  key={item}
                  onClick={() => setActiveView(item)}
                  title={NAV_TOOLTIPS[item]}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    active
                      ? 'bg-white text-slate-950 shadow-[0_10px_24px_rgba(255,255,255,0.12)]'
                      : 'border border-white/5 bg-white/[0.03] text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />{item}</span>
                  <span className={`text-xs ${active ? 'text-slate-700' : 'text-slate-500'}`}>{String(index + 1).padStart(2, '0')}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-6 rounded-[28px] border border-cyan-400/15 bg-cyan-400/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Next unlock</p>
            <p className="mt-2 truncate text-sm text-slate-200" title="Deeper cron and runtime integrations can drop into this shell without redesigning the UI again.">Deeper cron and runtime integrations can drop into this shell without redesigning the UI again.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-cyan-100/60">Sources</p>
                <p className="mt-1 font-semibold text-white">{data.commandDeck.sourceCount}</p>
              </div>
              <div>
                <p className="text-cyan-100/60">Project docs</p>
                <p className="mt-1 font-semibold text-white">{data.commandDeck.projectCount}</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-5">
          <header className="rounded-[32px] border border-white/8 bg-[linear-gradient(145deg,rgba(14,23,45,0.95),rgba(7,12,24,0.96))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/70">{heading.eyebrow}</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight text-white md:text-5xl">{heading.title}</h2>
                <p className="mt-4 truncate text-sm text-slate-300 md:text-base" title={heading.description}>{heading.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                {data.overview.quickStats.map((item) => {
                  const valueClass = item.label.toLowerCase().includes('running')
                    ? 'text-[#00ff88]'
                    : item.label.toLowerCase().includes('blocked')
                      ? 'text-[#ef4444]'
                      : 'text-white'
                  return (
                    <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4" title="Quick health counters so you can see system risk in seconds.">
                      <p className="text-sm text-slate-400">{item.label}</p>
                      <p className={`mt-2 text-2xl font-semibold ${valueClass}`}>{item.value}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </header>

          {activeView === 'Overview' && <OverviewView data={data} />}
          {activeView === 'Schedule' && <ScheduleView data={data} liveSyncLabel={liveSyncLabel} />}
          {activeView === 'Agents' && <AgentsView data={data} />}
          {activeView === 'Approvals' && <ApprovalsView data={data} />}
          {activeView === 'Portfolio' && <PortfolioView data={data} />}
          {activeView === 'Projects' && <ProjectsView data={data} />}
          {activeView === 'World' && <WorldView world={data.world} />}
          {activeView === 'Memory' && <MemoryView data={data} />}
          {activeView === 'Documents' && <DocumentsView data={data} />}
          {activeView === 'System' && <SystemView data={data} />}
          {activeView === 'Settings' && <SettingsView data={data} />}
        </section>
      </div>
    </main>
  )
}

function OverviewView({ data }: { data: MissionControlData }) {
  return (
    <section className="space-y-4" title="Overview explains what is happening right now and where attention is needed.">
      <div className="flex justify-end">
        <SectionHint text="Overview is your fast answer to: what is happening now, who owns it, and where risk is building." />
      </div>
      <div className="grid gap-5 2xl:grid-cols-[1.2fr_0.9fr]">
      <div className="space-y-5">
        <div className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Agent status</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Karl, Hex, Warren</h3>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">Execution visibility</div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {data.overview.agentCards.map((agent) => {
              const theme = agentTheme(agent.name)
              return (
                <article key={agent.name} className="rounded-[28px] border border-white/8 border-l-4 bg-white/[0.03] p-4 min-h-[228px]" style={{ borderLeftColor: theme.color }} title="Each agent card shows ownership, live status, and progress so you know who is doing what.">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.color, boxShadow: `0 0 16px ${theme.color}` }} />
                        <span className="text-3xl leading-none sm:text-4xl" aria-hidden>{theme.emoji}</span>
                        <p className="text-lg font-semibold text-white">{agent.name}</p>
                      </div>
                      <p className="mt-1 truncate text-sm" style={{ color: agent.name === 'Warren' ? '#fcd34d' : '#94a3b8' }} title={theme.tagline}>{theme.tagline}</p>
                    </div>
                    <span className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusBadgeClass(agent.status)}`}>{agent.status}</span>
                  </div>

                  <p className="mt-4 truncate text-sm leading-6" style={{ color: agent.name === 'Warren' ? '#fde68a' : '#e2e8f0' }}>{agent.focus}</p>
                  {agent.name === 'Karl' && typeof agent.pendingDelegations === 'number' ? (
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-red-200">Pending delegations: {agent.pendingDelegations}</p>
                  ) : null}
                  <p className="mt-3 truncate text-xs uppercase tracking-[0.16em] text-slate-500" title={agent.lastUpdate}>Latest: {agent.lastUpdate}</p>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full" style={{ width: `${agent.progress}%`, backgroundColor: theme.color }} />
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Cron timeline</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Today’s operating rhythm</h3>
          <div className="mt-5 grid gap-4 xl:grid-cols-4">
            {data.overview.timeline.map((item) => (
              <article key={`${item.time}-${item.title}`} className={`rounded-[28px] border p-4 ${toneClasses(item.tone)}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-80">{item.time}</p>
                <h4 className="mt-3 text-lg font-semibold text-white">{item.title}</h4>
                <p className="mt-3 truncate text-sm text-inherit/90" title={item.detail}>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Morning brief preview</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">What Jared should know fast</h3>
        <div className="mt-5 space-y-3">
          {data.overview.morningBrief.map((item) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200" title={item}>
              <p className="truncate">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(17,24,39,0.8),rgba(8,12,22,0.95))] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Source confidence</p>
          <p className="mt-2 text-2xl font-semibold text-white">Real local context first.</p>
          <p className="mt-3 truncate text-sm text-slate-300" title="CURRENT_TASK, workspace memory files, and project docs are already driving these cards. Missing live integrations stay labeled as placeholders instead of being faked.">CURRENT_TASK, workspace memory files, and project docs are already driving these cards. Missing live integrations stay labeled as placeholders instead of being faked.</p>
        </div>
      </div>
      </div>
    </section>
  )
}

function ScheduleView({ data, liveSyncLabel }: { data: MissionControlData; liveSyncLabel: string }) {
  return (
    <section className="space-y-4" title="Schedule shows what jobs run each day so timing and workload are predictable.">
      <div className="flex justify-end">
        <SectionHint text="Schedule explains when automated work runs so you can plan around it and catch timing conflicts early." />
      </div>
      <div className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] lg:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100">
        <span className="font-semibold uppercase tracking-[0.16em]">Live cron sync every 30s</span>
        <span>Last sync {liveSyncLabel}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {data.schedule.map((day) => (
          <article
            key={day.day}
            className={`rounded-[24px] border p-3 ${
              day.active
                ? 'border-cyan-300/30 bg-cyan-300/[0.08] shadow-[0_0_0_1px_rgba(103,232,249,0.08)]'
                : 'border-white/8 bg-white/[0.03]'
            }`}
          >
            <div className="flex items-end justify-between border-b border-white/8 pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-white">{day.day}</p>
                  {day.active ? <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">Today</span> : null}
                </div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Scheduled blocks</p>
              </div>
              <span className="text-xs font-medium text-slate-400">{day.date}</span>
            </div>
            <div className="mt-3 space-y-2.5">
              {day.jobs.length ? (
                day.jobs.map((job) => (
                  <div key={`${day.day}-${job.time}-${job.title}`} className="rounded-2xl border border-white/8 bg-[#070c17] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">{job.time}</p>
                      {job.status ? <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${statusBadgeClass(job.status)}`}>{job.status}</span> : null}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-white">{job.title}</p>
                    <p className="mt-1.5 truncate text-xs text-slate-300">{job.detail}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-[#070c17]/60 p-4 text-sm leading-6 text-slate-400">
                  No scheduled jobs mapped to this day from the current local cron data.
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
      </div>
    </section>
  )
}

function AgentsView({ data }: { data: MissionControlData }) {
  return (
    <section className="space-y-4" title="Agents view makes ownership clear: who is doing what, and whether they are healthy or blocked.">
      <div className="flex justify-end">
        <SectionHint text="Agents shows ownership, status, and recent actions so accountability is obvious at a glance." />
      </div>
      <div className="grid gap-5 2xl:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {data.agents.cards.map((agent) => {
          const theme = agentTheme(agent.name)
          return (
            <article key={agent.name} className="rounded-[32px] border border-white/8 border-l-4 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] min-h-[280px]" style={{ borderLeftColor: theme.color }} title="Agent identity card: who they are, what they own, and how execution is going.">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.color, boxShadow: `0 0 16px ${theme.color}` }} />
                  <span className="text-3xl leading-none sm:text-4xl" aria-hidden>{theme.emoji}</span>
                  <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
                </div>
                <p className="mt-2 truncate text-sm" style={{ color: agent.name === 'Warren' ? '#fcd34d' : '#94a3b8' }} title={theme.tagline}>{theme.tagline}</p>
              </div>
              <p className="mt-4 truncate text-sm leading-7" style={{ color: agent.name === 'Warren' ? '#fde68a' : '#e2e8f0' }}>{agent.focus}</p>
              {agent.name === 'Karl' && typeof agent.pendingDelegations === 'number' ? (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-red-200">Pending delegations: {agent.pendingDelegations}</p>
              ) : null}
              <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-slate-300">Status</span>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${statusBadgeClass(agent.status)}`}>{agent.status}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full" style={{ width: `${agent.progress}%`, backgroundColor: theme.color }} />
                </div>
                <p className="mt-3 truncate text-xs uppercase tracking-[0.16em] text-slate-400" title={agent.lastUpdate}>Latest: {agent.lastUpdate}</p>
              </div>
            </article>
          )
        })}
      </div>

      <div className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Delegation flow</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Jared → Karl → (Hex / Warren / Scout / Quill)</h3>
        <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">
          <p className="font-semibold text-white">Routing map</p>
          <p className="mt-2">Jared initiates direction, Karl routes work, specialists execute by domain.</p>
        </div>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Recent activity</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">#hex-updates</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">#warren-updates</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">#scout-updates</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">#quill-updates</span>
        </div>
        <div className="mt-5 space-y-3">
          {data.agents.recentActivity.map((item) => {
            const theme = agentTheme(item.agent)
            return (
              <article key={`${item.agent}-${item.summary}`} className="rounded-3xl border border-white/10 border-l-4 bg-white/[0.04] p-4" style={{ borderLeftColor: theme.color }} title="Activity feed shows who triggered each update so accountability is obvious.">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-white">{item.summary}</p>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.time}</span>
                </div>
                <p className="mt-2 text-sm" style={{ color: theme.color }}>{theme.emoji} {item.agent}</p>
                <p className="mt-3 truncate text-sm text-slate-300" title={item.detail}>{item.detail}</p>
              </article>
            )
          })}
        </div>
      </div>
      </div>
    </section>
  )
}

function ApprovalsView({ data }: { data: MissionControlData }) {
  const approvals = [
    ...data.projects
      .filter((project) => project.blockers.length > 0)
      .map((project) => ({
        owner: project.owner,
        item: `${project.name}: clear blocker`,
        urgency: 'High',
        detail: project.blockers[0],
      })),
    ...data.agents.cards
      .filter((agent) => (agent.pendingDelegations ?? 0) > 0)
      .map((agent) => ({
        owner: agent.name,
        item: `${agent.pendingDelegations} pending delegation${agent.pendingDelegations === 1 ? '' : 's'}`,
        urgency: 'Medium',
        detail: `Routing follow-ups needed for ${agent.focus.toLowerCase()}.`,
      })),
    ...data.system.securityWarnings.slice(0, 2).map((warning) => ({
      owner: 'Karl',
      item: 'Review system warning',
      urgency: 'Medium',
      detail: warning,
    })),
  ]

  const deduped = approvals.filter((approval, index) =>
    approvals.findIndex((candidate) => candidate.item === approval.item && candidate.detail === approval.detail) === index,
  )

  return (
    <section className="space-y-4" title="Approvals queue keeps decision bottlenecks visible so blockers can be cleared quickly.">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Needs decision</p>
          <p className="mt-2 text-2xl font-semibold text-white">{deduped.length}</p>
          <p className="mt-1 text-sm text-slate-300">Active approvals requiring owner input</p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">High urgency</p>
          <p className="mt-2 text-2xl font-semibold text-white">{deduped.filter((item) => item.urgency === 'High').length}</p>
          <p className="mt-1 text-sm text-slate-300">Blockers that directly stall delivery</p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">System linked</p>
          <p className="mt-2 text-2xl font-semibold text-white">{deduped.filter((item) => item.item.toLowerCase().includes('system')).length}</p>
          <p className="mt-1 text-sm text-slate-300">Approvals tied to runtime + reliability state</p>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {deduped.length ? (
          deduped.map((approval, index) => (
            <article key={`${approval.item}-${index}`} className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{approval.owner}</p>
                <span
                  className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${approval.urgency === 'High' ? 'border-rose-400/50 bg-rose-400/15 text-rose-100' : 'border-amber-300/40 bg-amber-300/10 text-amber-100'}`}
                >
                  {approval.urgency}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{approval.item}</h3>
              <p className="mt-2 text-sm text-slate-300">{approval.detail}</p>
            </article>
          ))
        ) : (
          <article className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-sm text-emerald-100 md:col-span-2 xl:col-span-3">
            No approvals waiting right now — everything is unblocked.
          </article>
        )}
      </div>
    </section>
  )
}

function PortfolioView({ data }: { data: MissionControlData }) {
  const router = useRouter()
  const palette = ['#00ff88', '#f59e0b', '#3b82f6', '#ef4444', '#888888']

  const donut = (entries: { category: string; weight: number }[]) => {
    let current = 0
    const slices = entries.map((entry, index) => {
      const start = current
      current += entry.weight
      return `${palette[index % palette.length]} ${start}% ${current}%`
    })
    return `conic-gradient(${slices.join(', ')})`
  }

  const refresh = () => router.refresh()

  const addHolding = async (account: 'Personal' | 'Business') => {
    const ticker = window.prompt('Ticker (e.g. AAPL)')?.trim()
    if (!ticker) return
    const name = window.prompt('Name')?.trim()
    if (!name) return
    const value = Number(window.prompt('Current value ($)', '0') || '0')
    const category = window.prompt('Category', 'Stocks') || 'Stocks'
    await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ account, ticker, name, value, category }) })
    refresh()
  }

  const mutateHolding = async (id: string, payload: Record<string, unknown>, method = 'PATCH') => {
    await fetch(`/api/portfolio/${id}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    refresh()
  }

  return (
    <section className="space-y-5" title="Portfolio summarizes money posture and risk at a glance.">
      <div className="flex justify-end">
        <SectionHint text="Portfolio is now DB-backed: add, edit, buy/sell, and notes persist after reload and sync back to Warren's source file." />
      </div>
      <article className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/70">Warren portfolio</p>
            <h3 className="mt-2 text-3xl font-semibold text-white">Net worth: {data.portfolio.netWorth}</h3>
            <p className="mt-2 text-sm text-slate-400">Last updated {data.portfolio.lastUpdated}</p>
          </div>
          <p className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100" title="Primary source: Prisma + SQLite in mission-control.db. Sync writes mirror changes to workspace-warren/portfolio.json.">
            Source: Prisma + SQLite
          </p>
        </div>
      </article>

      <div className="grid gap-5 xl:grid-cols-2">
        {data.portfolio.columns.map((column) => (
          <article key={column.label} className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-2xl font-semibold text-white">{column.label}</h4>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-100">{column.total}</span>
                <button type="button" onClick={() => addHolding(column.label)} className="rounded-lg border border-emerald-300/40 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-100">Add</button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
              <div className="mx-auto h-32 w-32 rounded-full" style={{ background: donut(column.allocations) }} />
              <div className="space-y-2 text-sm">
                {column.allocations.map((entry, index) => (
                  <div key={`${column.label}-${entry.category}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                      <span>{entry.category}</span>
                    </div>
                    <span className="text-slate-400">{entry.weight}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-white/[0.03] text-left text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Ticker</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Value</th>
                    <th className="px-3 py-2">Weight</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {column.holdings.length ? (
                    column.holdings.map((holding) => (
                      <tr key={holding.id} className="bg-[#070c17] text-slate-200">
                        <td className="px-3 py-2 font-semibold text-white">{holding.ticker}</td>
                        <td className="px-3 py-2">
                          <p>{holding.name}</p>
                          {holding.notes ? <p className="truncate text-xs text-slate-500" title={holding.notes}>{holding.notes}</p> : null}
                        </td>
                        <td className="px-3 py-2">{holding.value}</td>
                        <td className="px-3 py-2">{holding.weight}%</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1 text-xs">
                            <button type="button" onClick={() => mutateHolding(holding.id, { action: 'buy', amount: Number(window.prompt('Buy amount ($)', '0') || '0'), note: window.prompt('Optional buy note', '') || '' })} className="rounded border border-emerald-300/40 bg-emerald-300/10 px-2 py-0.5 text-emerald-100">Buy</button>
                            <button type="button" onClick={() => mutateHolding(holding.id, { action: 'sell', amount: Number(window.prompt('Sell amount ($)', '0') || '0'), note: window.prompt('Optional sell note', '') || '' })} className="rounded border border-amber-300/40 bg-amber-300/10 px-2 py-0.5 text-amber-100">Sell</button>
                            <button type="button" onClick={() => mutateHolding(holding.id, { ticker: window.prompt('Ticker', holding.ticker) || holding.ticker, name: window.prompt('Name', holding.name) || holding.name, value: Number(window.prompt('Current value ($)', String(holding.value).replace(/[^\d.-]/g, '')) || '0'), category: window.prompt('Category', holding.category) || holding.category })} className="rounded border border-cyan-300/40 bg-cyan-300/10 px-2 py-0.5 text-cyan-100">Edit</button>
                            <button type="button" onClick={() => mutateHolding(holding.id, { notes: window.prompt('Notes', holding.notes || '') || '' })} className="rounded border border-blue-300/40 bg-blue-300/10 px-2 py-0.5 text-blue-100">Note</button>
                            <button type="button" onClick={() => { if (window.confirm(`Delete ${holding.ticker}?`)) void mutateHolding(holding.id, {}, 'DELETE') }} className="rounded border border-red-400/40 bg-red-400/10 px-2 py-0.5 text-red-100">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-[#070c17] text-slate-400">
                      <td colSpan={5} className="px-3 py-4 text-center">No DB holdings yet. Use Add to create one.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function ProjectsView({ data }: { data: MissionControlData }) {
  const router = useRouter()
  const [selected, setSelected] = useState<MissionControlData['projects'][number] | null>(null)
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Blocked' | 'Complete'>('All')
  const [addState, setAddState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [mutateState, setMutateState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const submitProject = async () => {
    if (!projectName.trim()) return
    setAddState('saving')
    try {
      const response = await fetch('/api/projects/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName, description: projectDesc }),
      })
      if (!response.ok) throw new Error('save failed')
      setProjectName('')
      setProjectDesc('')
      setAddState('saved')
      router.refresh()
    } catch {
      setAddState('error')
    }
  }

  const mutateProject = async (projectId: string, payload: Record<string, unknown>, method: 'PATCH' | 'DELETE' = 'PATCH') => {
    setMutateState('saving')
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method,
        headers: method === 'PATCH' ? { 'Content-Type': 'application/json' } : undefined,
        body: method === 'PATCH' ? JSON.stringify(payload) : undefined,
      })
      if (!response.ok) throw new Error('update failed')
      setMutateState('saved')
      setSelected(null)
      router.refresh()
    } catch {
      setMutateState('error')
    }
  }

  const projectCounts = useMemo(() => {
    const counts = { active: 0, blocked: 0, complete: 0 }
    for (const project of data.projects) {
      const normalized = project.status.toLowerCase()
      if (normalized.includes('block')) counts.blocked += 1
      else if (normalized.includes('complete') || normalized.includes('done')) counts.complete += 1
      else counts.active += 1
    }
    return counts
  }, [data.projects])

  const visibleProjects = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.projects.filter((project) => {
      const normalized = project.status.toLowerCase()
      const matchesFilter =
        statusFilter === 'All' ||
        (statusFilter === 'Blocked' && normalized.includes('block')) ||
        (statusFilter === 'Complete' && (normalized.includes('complete') || normalized.includes('done'))) ||
        (statusFilter === 'Active' && !normalized.includes('block') && !normalized.includes('complete') && !normalized.includes('done'))

      if (!matchesFilter) return false
      if (!q) return true

      return (
        project.name.toLowerCase().includes(q) ||
        project.owner.toLowerCase().includes(q) ||
        project.status.toLowerCase().includes(q) ||
        project.detail.toLowerCase().includes(q)
      )
    })
  }, [data.projects, query, statusFilter])

  return (
    <section className="space-y-5" title="Projects view tracks delivery progress and blockers so shipping stays predictable.">
      <div className="flex justify-end">
        <SectionHint text="Projects tells you what is shipping, what is blocked, and who owns each delivery stream." />
      </div>
      <article className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Hex projects</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Active delivery board</h3>
          </div>
          <span className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">Source: Prisma + SQLite</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="New project name" className="rounded-xl border border-white/10 bg-[#070c17] px-3 py-2 text-sm text-white placeholder:text-slate-500" />
          <input value={projectDesc} onChange={(event) => setProjectDesc(event.target.value)} placeholder="One-line description" className="rounded-xl border border-white/10 bg-[#070c17] px-3 py-2 text-sm text-white placeholder:text-slate-500" />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={submitProject} className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/20">Add new project</button>
          <span className="text-xs text-slate-400">{addState === 'saved' ? 'Saved to local database' : addState === 'error' ? 'Could not save project' : addState === 'saving' ? 'Saving…' : 'Writes directly to Prisma + SQLite'}</span>
        </div>
      </article>

      <article className="rounded-[28px] border border-white/8 bg-[#091120]/90 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, owners, or status"
            className="w-full max-w-sm rounded-xl border border-white/10 bg-[#070c17] px-3 py-2 text-sm text-white placeholder:text-slate-500"
          />
          <div className="flex flex-wrap gap-2">
            {([
              ['All', data.projects.length],
              ['Active', projectCounts.active],
              ['Blocked', projectCounts.blocked],
              ['Complete', projectCounts.complete],
            ] as const).map(([label, count]) => (
              <button
                key={label}
                type="button"
                onClick={() => setStatusFilter(label)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  statusFilter === label
                    ? 'border-cyan-300/50 bg-cyan-300/20 text-cyan-100'
                    : 'border-white/15 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                {label} · {count}
              </button>
            ))}
          </div>
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-3">
        {visibleProjects.map((project) => {
          const ownerTheme = agentTheme(project.owner)
          return (
          <article key={project.name} className="rounded-[32px] border border-white/8 border-l-4 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]" style={{ borderLeftColor: ownerTheme.color }} title="Project cards show delivery status, ownership, and latest commit proof.">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: ownerTheme.color }} />Owner · {project.owner}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${projectStatusBadgeClass(project.status)}`}>{project.status}</span>
            </div>
            <p className="mt-4 truncate text-sm text-slate-300">{project.detail}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">Last commit</p>
            <p className="mt-1 text-sm text-slate-200">{project.lastCommitHash} · {project.lastCommitMessage}</p>
            <p className="mt-1 text-xs text-slate-500">{project.lastCommitDate}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.techStack.map((item) => (
                <span key={`${project.name}-${item}`} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">{item}</span>
              ))}
            </div>
            <div className="mt-5 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full" style={{ width: `${project.progress}%`, backgroundColor: ownerTheme.color }} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="text-sm text-slate-300">{project.progress}% complete</p>
              <div className="flex items-center gap-2">
                {project.id ? (
                  <button
                    type="button"
                    onClick={() => mutateProject(project.id!, { status: project.status.toLowerCase().includes('block') ? 'In Progress' : 'Blocked' })}
                    className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:bg-amber-300/20"
                  >
                    Toggle status
                  </button>
                ) : null}
                <button type="button" onClick={() => setSelected(project)} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.08]">View details</button>
              </div>
            </div>
          </article>
          )
        })}
      </div>

      {!visibleProjects.length ? (
        <article className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.02] p-5 text-sm text-slate-300">
          No projects match this filter yet. Try a broader search or switch status chips.
        </article>
      ) : null}

      {selected ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <article className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-[#0b1222] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Project detail</p>
                <h4 className="mt-2 text-2xl font-semibold text-white">{selected.name}</h4>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg border border-white/10 px-3 py-1 text-sm text-slate-300">Close</button>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">{selected.objective}</p>
            {selected.id ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const nextName = window.prompt('Project name', selected.name)
                    if (!nextName) return
                    const nextDescription = window.prompt('One-line description', selected.detail) ?? selected.detail
                    const nextOwner = window.prompt('Owner (Karl/Hex/Warren)', selected.owner) ?? selected.owner
                    const nextStatus = window.prompt('Status', selected.status) ?? selected.status
                    const nextProgress = Number(window.prompt('Progress %', String(selected.progress)) || String(selected.progress))
                    void mutateProject(selected.id!, {
                      name: nextName,
                      description: nextDescription,
                      owner: nextOwner,
                      status: nextStatus,
                      progress: nextProgress,
                    })
                  }}
                  className="rounded border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-cyan-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(`Delete ${selected.name}?`)) return
                    void mutateProject(selected.id!, {}, 'DELETE')
                  }}
                  className="rounded border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-red-100"
                >
                  Delete
                </button>
                <span className="text-slate-400">{mutateState === 'saved' ? 'Saved to local database' : mutateState === 'error' ? 'Update failed' : mutateState === 'saving' ? 'Saving…' : 'Editable project intake record'}</span>
              </div>
            ) : null}
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Completed</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-200">{selected.completedMilestones.map((item) => <li key={item}>• {item}</li>)}</ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Remaining</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-200">{selected.remainingWork.map((item) => <li key={item}>• {item}</li>)}</ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-red-300">Blockers</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-200">{selected.blockers.length ? selected.blockers.map((item) => <li key={item}>• {item}</li>) : <li>• None right now</li>}</ul>
              </div>
            </div>
            <p className="mt-5 text-xs text-slate-500">Assets: {selected.assets.length ? selected.assets.join(', ') : 'No assets attached yet'}</p>
          </article>
        </div>
      ) : null}
    </section>
  )
}

function MemoryView({ data }: { data: MissionControlData }) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const categoryLabel: Record<string, string> = {
    overnight: 'Overnight logs',
    'daily-digest': 'Daily digests',
    reliability: 'Reliability logs',
    queue: 'Queue files',
    other: 'Other',
  }

  const categoryClass: Record<string, string> = {
    overnight: 'border-blue-400/30 bg-blue-400/10 text-blue-100',
    'daily-digest': 'border-blue-300/20 bg-blue-300/10 text-blue-100',
    reliability: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
    queue: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100',
    other: 'border-slate-400/25 bg-slate-400/10 text-slate-200',
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data.memory
    return data.memory.filter((item) => item.filename.toLowerCase().includes(q) || item.content.toLowerCase().includes(q))
  }, [data.memory, query])

  const grouped = useMemo(() => {
    const order = ['overnight', 'daily-digest', 'reliability', 'queue', 'other'] as const
    return order
      .map((category) => ({
        category,
        items: filtered.filter((item) => item.category === category),
      }))
      .filter((group) => group.items.length)
  }, [filtered])

  return (
    <section className="space-y-4" title="Memory shows historical notes so new users understand continuity and prior decisions.">
      <div className="flex justify-end">
        <SectionHint text="Memory gives continuity by showing what was logged before, so decisions are grounded in real history." />
      </div>
      <div className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-semibold text-white">Workspace Memory</h3>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search filename or content"
          className="w-full max-w-sm rounded-xl border border-white/10 bg-[#070c17] px-3 py-2 text-sm text-white placeholder:text-slate-500"
        />
      </div>

      {data.memory.length === 0 ? (
        <article className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.02] p-6 text-sm leading-7 text-slate-300">
          No memory files yet — Karl writes here automatically each night
        </article>
      ) : filtered.length === 0 ? (
        <article className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 text-sm text-slate-300">No files match your search.</article>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.category}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{categoryLabel[group.category]}</p>
              <div className="grid gap-4 xl:grid-cols-2">
                {group.items.map((item) => {
                  const isExpanded = expanded === item.filename
                  return (
                    <article
                      key={item.filename}
                      className="cursor-pointer rounded-[28px] border border-white/8 bg-white/[0.03] p-4"
                      title="Memory cards show what was recorded, when it changed, and let you open the full note."
                      onClick={() => setExpanded(isExpanded ? null : item.filename)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setExpanded(isExpanded ? null : item.filename)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-lg font-semibold text-white">{item.filename}</p>
                          <p className="mt-1 text-xs text-slate-400">Updated {item.updatedAt}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${categoryClass[item.category]}`}>{categoryLabel[item.category]}</span>
                      </div>

                      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-white/10 bg-[#070c17] p-3 text-xs leading-6 text-slate-200">{item.preview}</pre>

                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{isExpanded ? 'Click card to collapse' : 'Click card to open full memory'}</p>

                      {isExpanded ? (
                        <div className="prose prose-invert mt-4 max-w-none rounded-2xl border border-white/10 bg-[#070c17] p-4 prose-p:text-slate-200 prose-headings:text-white prose-strong:text-white">
                          <ReactMarkdown>{item.content}</ReactMarkdown>
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </section>
  )
}


function DocumentsView({ data }: { data: MissionControlData }) {
  return (
    <section className="space-y-4" title="Documents keeps key files easy to open so context is never buried.">
      <div className="flex justify-end">
        <SectionHint text="Documents gives one-click access to core files so handoffs are faster." />
      </div>
      <div className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Source files</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Workspace references</h3>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {data.documents.map((doc) => (
            <a
              key={doc.href}
              href={doc.href}
              className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4 transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.08]"
              title={doc.note}
            >
              <p className="text-lg font-semibold text-white">{doc.title}</p>
              <p className="mt-2 truncate text-sm text-slate-300">{doc.note}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">{doc.href}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function SystemView({ data }: { data: MissionControlData }) {
  const [sortBy, setSortBy] = useState<'status' | 'lastRun' | 'nextRun' | 'consecutiveErrors'>('consecutiveErrors')
  const [expandedCronId, setExpandedCronId] = useState<string | null>(null)
  const [systemActionState, setSystemActionState] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [systemActionMessage, setSystemActionMessage] = useState('')
  const sortedRows = [...data.system.cronRows].sort((a, b) => {
    if (sortBy === 'consecutiveErrors') return b.consecutiveErrors - a.consecutiveErrors
    return a[sortBy].localeCompare(b[sortBy])
  })

  const runSystemAction = async (action: 'restart-gateway' | 'health-check' | 'clear-error-backoff') => {
    setSystemActionState('running')
    setSystemActionMessage('Running command…')
    try {
      const response = await fetch('/api/system/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const payload = (await response.json()) as { ok?: boolean; message?: string; output?: string; error?: string }
      if (!response.ok || !payload.ok) throw new Error(payload.error || 'Command failed')
      setSystemActionState('success')
      setSystemActionMessage(payload.message || payload.output || 'Command completed.')
    } catch (error) {
      setSystemActionState('error')
      setSystemActionMessage(error instanceof Error ? error.message : 'Command failed.')
    }
  }

  return (
    <section className="space-y-5" title="System view highlights runtime health so issues are caught before they cascade.">
      <div className="flex justify-end">
        <SectionHint text="System health shows if automation is stable, where failures are happening, and what needs intervention." />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {data.system.metrics.map((item) => (
          <article key={item.label} className="rounded-[28px] border border-white/8 bg-[#091120]/90 p-4">
            <p className="text-sm text-slate-400">{item.label}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{item.value}</h3>
            <p className="mt-2 truncate text-sm text-slate-300">{item.detail}</p>
          </article>
        ))}
      </div>

      <article className="rounded-[28px] border border-white/8 bg-[#091120]/90 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">7-day reliability</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Scheduler confidence trend</h3>
          </div>
          <p className="text-xs text-slate-400">Derived from the latest 7-run reliability signal across all jobs.</p>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {data.system.reliabilityWeek.map((point) => (
            <div key={point.day} className="rounded-xl border border-white/10 bg-[#070c17] p-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{point.day}</p>
              <div className="mx-auto mt-2 flex h-20 w-full max-w-8 items-end justify-center rounded bg-white/[0.03] p-1">
                <span className="w-full rounded-sm bg-cyan-300/80" style={{ height: `${Math.max(8, Math.round(point.score * 0.72))}px` }} />
              </div>
              <p className="mt-2 text-xs font-semibold text-cyan-100">{point.score}%</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-semibold text-white">Cron reliability</h3>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => runSystemAction('restart-gateway')} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white hover:bg-white/[0.1]">Restart Gateway</button>
            <button onClick={() => runSystemAction('health-check')} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white hover:bg-white/[0.1]">Run Health Check</button>
            <button onClick={() => runSystemAction('clear-error-backoff')} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white hover:bg-white/[0.1]">Clear Error Backoff</button>
            {systemActionState !== 'idle' ? (
              <span className={`text-xs ${systemActionState === 'error' ? 'text-red-300' : systemActionState === 'success' ? 'text-emerald-300' : 'text-slate-300'}`}>{systemActionMessage}</span>
            ) : null}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-slate-400">
              <tr>
                <th className="px-3 py-2">Job</th>
                <th className="px-3 py-2"><button onClick={() => setSortBy('status')}>Status</button></th>
                <th className="px-3 py-2"><button onClick={() => setSortBy('lastRun')}>Last run</button></th>
                <th className="px-3 py-2"><button onClick={() => setSortBy('nextRun')}>Next run</button></th>
                <th className="px-3 py-2"><button onClick={() => setSortBy('consecutiveErrors')}>Errors</button></th>
                <th className="px-3 py-2">7-run trend</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => {
                const isExpanded = expandedCronId === row.id
                return (
                  <Fragment key={row.id}>
                    <tr className="border-t border-white/10 bg-[#070c17] text-slate-200">
                      <td className="px-3 py-2">
                        <p className="font-semibold text-white">{row.name}</p>
                        <p className="truncate text-xs text-slate-500" title={row.lastOutputSummary}>{row.lastOutputSummary}</p>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${statusBadgeClass(row.status)}`}>{row.status}</span>
                      </td>
                      <td className="px-3 py-2">{row.lastRun}</td>
                      <td className="px-3 py-2">{row.nextRun}</td>
                      <td className="px-3 py-2">{row.consecutiveErrors}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-end gap-1">{row.miniReliability.map((point, index) => <span key={`${row.id}-${index}`} className="w-1.5 rounded-sm bg-cyan-300/80" style={{ height: `${Math.max(8, Math.round(point / 3))}px` }} />)}</div>
                          <button onClick={() => setExpandedCronId(isExpanded ? null : row.id)} className="rounded-md border border-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300 hover:bg-white/10">{isExpanded ? 'Hide' : 'Explain'}</button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr className="border-t border-white/5 bg-[#0a1020] text-slate-300">
                        <td colSpan={6} className="px-3 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/70">Plain-English job context</p>
                          <p className="mt-2 text-sm text-slate-200">{row.promptPreview}</p>
                          <p className="mt-2 text-xs text-slate-400">Latest output: {row.lastOutputSummary}</p>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </article>

      <div className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5">
          <h3 className="text-2xl font-semibold text-white">Error log</h3>
          <div className="mt-4 space-y-3">
            {data.system.errorLog.length ? data.system.errorLog.map((item) => (
              <div key={`${item.timestamp}-${item.jobName}`} className="rounded-2xl border border-red-400/20 bg-red-400/5 p-3">
                <p className="text-xs text-red-200">{item.timestamp} · {item.jobName}</p>
                <p className="mt-1 text-sm text-white">{item.message}</p>
                <p className="mt-1 text-xs text-slate-300">Suggested fix: {item.suggestedFix}</p>
              </div>
            )) : <p className="rounded-2xl border border-dashed border-white/12 p-3 text-sm text-slate-400">No recent errors in the last 20 entries.</p>}
          </div>
        </article>

        <article className="space-y-5 rounded-[32px] border border-white/8 bg-[#091120]/90 p-5">
          <div>
            <h3 className="text-2xl font-semibold text-white">Resource usage</h3>
            <div className="mt-4 space-y-3">
              {data.system.resourceUsage.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm"><span className="text-slate-300">{item.label}</span><span className="text-white">{item.value}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-emerald-300" style={{ width: `${item.percent}%` }} /></div>
                  <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Security warnings</h4>
            <ul className="mt-3 space-y-2">{data.system.securityWarnings.map((warning) => <li key={warning} className="rounded-xl border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-sm text-amber-100">{warning}</li>)}</ul>
          </div>
        </article>
      </div>
    </section>
  )
}

function SettingsView({ data }: { data: MissionControlData }) {
  const [selectedFrequency, setSelectedFrequency] = useState(data.settings.selectedFrequency)
  const [morningBriefTime, setMorningBriefTime] = useState(data.settings.morningBriefTime)
  const [marketBriefTime, setMarketBriefTime] = useState(data.settings.marketBriefTime)
  const [modelOverrides, setModelOverrides] = useState<Record<string, string>>(
    Object.fromEntries(data.settings.modelOverrides.map((override) => [override.agent, override.model])),
  )
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [savedLabel, setSavedLabel] = useState('')

  const saveSettings = async () => {
    setSaveState('saving')
    setSavedLabel('Saving settings…')
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedFrequency, morningBriefTime, marketBriefTime, modelOverrides }),
      })
      if (!response.ok) throw new Error('save failed')
      const stamp = new Intl.DateTimeFormat('en-CA', { hour: 'numeric', minute: '2-digit' }).format(new Date())
      setSaveState('saved')
      setSavedLabel(`Saved at ${stamp}`)
    } catch {
      setSaveState('error')
      setSavedLabel('Save failed. Check DB/API connectivity and try again.')
    }
  }

  return (
    <section className="space-y-4" title="Settings controls cadence, models, and routing so automation stays understandable.">
      <div className="flex justify-end">
        <SectionHint text="Settings lets you tune cadence and routing so automation stays predictable and easy to operate." />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
      <article className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Cadence controls</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Agent update frequency</h3>
        <fieldset className="mt-4 space-y-3 text-sm text-slate-200">
          <legend className="sr-only">Hex update frequency</legend>
          {data.settings.updateFrequencyOptions.map((option) => (
            <label key={option} className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <span>{option}</span>
              <input type="radio" name="hex-frequency" checked={option === selectedFrequency} onChange={() => setSelectedFrequency(option)} aria-label={option} />
            </label>
          ))}
        </fieldset>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">Morning brief time
            <input type="time" value={morningBriefTime} onChange={(event) => setMorningBriefTime(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#070c17] px-2 py-1 text-white" />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">Warren market brief time
            <input type="time" value={marketBriefTime} onChange={(event) => setMarketBriefTime(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#070c17] px-2 py-1 text-white" />
          </label>
        </div>
      </article>

      <article className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Routing + delivery</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Models and notifications</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          {data.settings.modelOverrides.map((override) => (
            <label key={override.agent} className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{override.agent} model override</span>
              <select value={modelOverrides[override.agent] ?? override.model} onChange={(event) => setModelOverrides((prev) => ({ ...prev, [override.agent]: event.target.value }))} className="mt-2 w-full rounded-lg border border-white/10 bg-[#070c17] px-2 py-1 text-white">
                {override.options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          ))}
          {data.settings.notificationRoutes.map((route) => (
            <div key={route.event} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span>{route.event}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs">{route.route}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={saveSettings}
            disabled={saveState === 'saving'}
            className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveState === 'saving' ? 'Saving…' : 'Save settings'}
          </button>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              saveState === 'saved'
                ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100'
                : saveState === 'error'
                  ? 'border-red-300/40 bg-red-300/15 text-red-100'
                  : saveState === 'saving'
                    ? 'border-cyan-300/40 bg-cyan-300/15 text-cyan-100'
                    : 'border-white/15 bg-white/[0.04] text-slate-300'
            }`}
          >
            {savedLabel || 'Changes persist in Prisma + SQLite'}
          </span>
        </div>
      </article>
      </div>
    </section>
  )
}
