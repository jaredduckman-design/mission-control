'use client'

import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { MissionControlData } from '../lib/mission-control-data'

const navItems = ['Overview', 'Schedule', 'Agents', 'Portfolio', 'Projects', 'Memory', 'System', 'Settings'] as const

type View = (typeof navItems)[number]

type AgentName = 'Karl' | 'Hex' | 'Warren'

const AGENT_THEME: Record<AgentName, { color: string; emoji: string; tagline: string }> = {
  Karl: { color: '#ef4444', emoji: '🦞', tagline: 'Your AI chief of staff' },
  Hex: { color: '#00ff88', emoji: '💻', tagline: 'Builds while you sleep' },
  Warren: { color: '#f59e0b', emoji: '💰', tagline: 'Watches your money' },
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
  if (normalized === 'MONITORING') return 'bg-amber-400 text-black border-amber-300'
  return 'bg-white/10 text-white border-white/20'
}

export function MissionControlDashboard({ data }: { data: MissionControlData }) {
  const [activeView, setActiveView] = useState<View>('Overview')
  const [showTour, setShowTour] = useState(true)

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
      case 'Portfolio':
        return {
          eyebrow: 'Portfolio scaffold',
          title: 'Holdings and risk can live here once real feeds are ready.',
          description: 'For now this section stays honest: we expose the slots, show what is missing, and leave room for actual market data later.',
        }
      case 'Projects':
        return {
          eyebrow: 'Project board',
          title: 'A concise scan of what is moving across the workspace.',
          description: 'This page keeps project status visible without dropping into chat or opening five folders.',
        }
      case 'Memory':
        return {
          eyebrow: 'Memory feed',
          title: 'Recent notes pulled from the real workspace memory folder.',
          description: 'The point here is continuity: quick summaries of what the system has already learned or recorded.',
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
          description: 'This page keeps the automation understandable for newcomers with plain-language controls and an onboarding replay.',
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
              <p className="mt-3 text-sm leading-6 text-slate-300">Generated from local workspace context at {data.generatedLabel}.</p>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Command deck</p>
            <p className="mt-3 text-sm leading-6 text-slate-200">{data.commandDeck.focus}</p>
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
              const dotColor = item === 'Agents' ? AGENT_THEME.Karl.color : item === 'Projects' ? AGENT_THEME.Hex.color : item === 'Portfolio' ? AGENT_THEME.Warren.color : '#64748b'
              return (
                <button
                  key={item}
                  onClick={() => setActiveView(item)}
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
            <p className="mt-2 text-sm leading-6 text-slate-200">Deeper cron and runtime integrations can drop into this shell without redesigning the UI again.</p>
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
                <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">{heading.description}</p>
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
          {activeView === 'Schedule' && <ScheduleView data={data} />}
          {activeView === 'Agents' && <AgentsView data={data} />}
          {activeView === 'Portfolio' && <PortfolioView data={data} />}
          {activeView === 'Projects' && <ProjectsView data={data} />}
          {activeView === 'Memory' && <MemoryView data={data} />}
          {activeView === 'System' && <SystemView data={data} />}
          {activeView === 'Settings' && <SettingsView data={data} onReplayTour={() => setShowTour(true)} />}
        </section>
      </div>
      {showTour ? <OnboardingTour onClose={() => setShowTour(false)} /> : null}
    </main>
  )
}

function OverviewView({ data }: { data: MissionControlData }) {
  return (
    <section className="grid gap-5 2xl:grid-cols-[1.2fr_0.9fr]" title="Overview explains what is happening right now and where attention is needed.">
      <div className="space-y-5">
        <div className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Agent status</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Karl, Hex, Warren</h3>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">Execution visibility</div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-3">
            {data.overview.agentCards.map((agent) => {
              const theme = agentTheme(agent.name)
              return (
                <article key={agent.name} className="rounded-[28px] border border-white/8 border-l-4 bg-white/[0.03] p-4" style={{ borderLeftColor: theme.color }} title="Each agent card shows ownership, live status, and progress so you know who is doing what.">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.color, boxShadow: `0 0 16px ${theme.color}` }} />
                        <span className="text-2xl" aria-hidden>{theme.emoji}</span>
                        <p className="text-lg font-semibold text-white">{agent.name}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{theme.tagline}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusBadgeClass(agent.status)}`}>{agent.status}</span>
                  </div>

                  <p className="mt-4 truncate text-sm leading-6 text-slate-200">{agent.focus}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">Last update</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{agent.lastUpdate}</p>
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
                <p className="mt-3 text-sm leading-6 text-inherit/90">{item.detail}</p>
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
            <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-200">
              {item}
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(17,24,39,0.8),rgba(8,12,22,0.95))] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Source confidence</p>
          <p className="mt-2 text-2xl font-semibold text-white">Real local context first.</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">CURRENT_TASK, workspace memory files, and project docs are already driving these cards. Missing live integrations stay labeled as placeholders instead of being faked.</p>
        </div>
      </div>
    </section>
  )
}

function ScheduleView({ data }: { data: MissionControlData }) {
  return (
    <section className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]" title="Schedule shows what jobs run each day so timing and workload are predictable.">
      <div className="grid gap-4 xl:grid-cols-5">
        {data.schedule.map((day) => (
          <article
            key={day.day}
            className={`rounded-[28px] border p-4 ${
              day.active
                ? 'border-cyan-300/30 bg-cyan-300/[0.08] shadow-[0_0_0_1px_rgba(103,232,249,0.08)]'
                : 'border-white/8 bg-white/[0.03]'
            }`}
          >
            <div className="flex items-end justify-between border-b border-white/8 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-white">{day.day}</p>
                  {day.active ? <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">Today</span> : null}
                </div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Scheduled blocks</p>
              </div>
              <span className="text-sm font-medium text-slate-400">{day.date}</span>
            </div>
            <div className="mt-4 space-y-3">
              {day.jobs.length ? (
                day.jobs.map((job) => (
                  <div key={`${day.day}-${job.time}-${job.title}`} className="rounded-3xl border border-white/8 bg-[#070c17] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">{job.time}</p>
                      {job.status ? <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${statusBadgeClass(job.status)}`}>{job.status}</span> : null}
                    </div>
                    <p className="mt-2 text-base font-semibold text-white">{job.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{job.detail}</p>
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
    </section>
  )
}

function AgentsView({ data }: { data: MissionControlData }) {
  return (
    <section className="grid gap-5 2xl:grid-cols-[1.1fr_0.9fr]" title="Agents view makes ownership clear: who is doing what, and whether they are healthy or blocked.">
      <div className="grid gap-4 xl:grid-cols-3">
        {data.agents.cards.map((agent) => {
          const theme = agentTheme(agent.name)
          return (
            <article key={agent.name} className="rounded-[32px] border border-white/8 border-l-4 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]" style={{ borderLeftColor: theme.color }} title="Agent identity card: who they are, what they own, and how execution is going.">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.color, boxShadow: `0 0 16px ${theme.color}` }} />
                <span className="text-2xl" aria-hidden>{theme.emoji}</span>
                <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-400">{theme.tagline}</p>
              <p className="mt-4 truncate text-sm leading-7 text-slate-200">{agent.focus}</p>
              <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Status</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${statusBadgeClass(agent.status)}`}>{agent.status}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full" style={{ width: `${agent.progress}%`, backgroundColor: theme.color }} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{agent.lastUpdate}</p>
              </div>
            </article>
          )
        })}
      </div>

      <div className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Recent activity</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Latest motion</h3>
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
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function PortfolioView({ data }: { data: MissionControlData }) {
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

  return (
    <section className="space-y-5" title="Portfolio summarizes money posture and risk at a glance.">
      <article className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/70">Warren portfolio</p>
            <h3 className="mt-2 text-3xl font-semibold text-white">Net worth: {data.portfolio.netWorth}</h3>
            <p className="mt-2 text-sm text-slate-400">Last updated {data.portfolio.lastUpdated}</p>
          </div>
          <button className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-300/20">Refresh</button>
        </div>
      </article>

      <div className="grid gap-5 xl:grid-cols-2">
        {data.portfolio.columns.map((column) => (
          <article key={column.label} className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <h4 className="text-2xl font-semibold text-white">{column.label}</h4>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-100">{column.total}</span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
              <div className="mx-auto h-32 w-32 rounded-full" style={{ background: donut(column.allocations) }} title="Indexes, banks, stocks, crypto, cash allocation" />
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {column.holdings.map((holding) => (
                    <tr key={`${column.label}-${holding.ticker}`} className="bg-[#070c17] text-slate-200">
                      <td className="px-3 py-2 font-semibold text-white">{holding.ticker}</td>
                      <td className="px-3 py-2">{holding.name}</td>
                      <td className="px-3 py-2">{holding.value}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-white/10">
                            <div className="h-2 rounded-full bg-amber-300" style={{ width: `${holding.weight}%` }} />
                          </div>
                          <span>{holding.weight}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
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
  const [selected, setSelected] = useState<MissionControlData['projects'][number] | null>(null)
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [addState, setAddState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

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
    } catch {
      setAddState('error')
    }
  }

  return (
    <section className="space-y-5" title="Projects view tracks delivery progress and blockers so shipping stays predictable.">
      <article className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Hex projects</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Active delivery board</h3>
          </div>
          <a href="/Users/jaredbot/.openclaw/workspace-hex/CURRENT_TASK.md" className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">Task source</a>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="New project name" className="rounded-xl border border-white/10 bg-[#070c17] px-3 py-2 text-sm text-white placeholder:text-slate-500" />
          <input value={projectDesc} onChange={(event) => setProjectDesc(event.target.value)} placeholder="One-line description" className="rounded-xl border border-white/10 bg-[#070c17] px-3 py-2 text-sm text-white placeholder:text-slate-500" />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={submitProject} className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/20">Add new project</button>
          <span className="text-xs text-slate-400">{addState === 'saved' ? 'Saved to CURRENT_TASK.md' : addState === 'error' ? 'Could not write to CURRENT_TASK.md' : addState === 'saving' ? 'Saving…' : 'Writes directly to workspace task brief'}</span>
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-3">
        {data.projects.map((project) => (
          <article key={project.name} className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: agentTheme(project.owner).color }} />Owner · {project.owner}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-100">{project.status}</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">{project.detail}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">Last commit</p>
            <p className="mt-1 text-sm text-slate-200">{project.lastCommitHash} · {project.lastCommitMessage}</p>
            <p className="mt-1 text-xs text-slate-500">{project.lastCommitDate}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.techStack.map((item) => (
                <span key={`${project.name}-${item}`} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">{item}</span>
              ))}
            </div>
            <div className="mt-5 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(125,211,252,1),rgba(52,211,153,1))]" style={{ width: `${project.progress}%` }} />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-300">{project.progress}% complete</p>
              <button type="button" onClick={() => setSelected(project)} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.08]">View details</button>
            </div>
          </article>
        ))}
      </div>

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
    <section className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]" title="Memory shows historical notes so new users understand continuity and prior decisions.">
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
                    <article key={item.filename} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-lg font-semibold text-white">{item.filename}</p>
                          <p className="mt-1 text-xs text-slate-400">Updated {item.updatedAt}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${categoryClass[item.category]}`}>{categoryLabel[item.category]}</span>
                      </div>

                      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-white/10 bg-[#070c17] p-3 text-xs leading-6 text-slate-200">{item.preview}</pre>

                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : item.filename)}
                        className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.08]"
                      >
                        {isExpanded ? 'Collapse' : 'Open full memory'}
                      </button>

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
    </section>
  )
}

function SystemView({ data }: { data: MissionControlData }) {
  const [sortBy, setSortBy] = useState<'status' | 'lastRun' | 'nextRun' | 'consecutiveErrors'>('consecutiveErrors')
  const sortedRows = [...data.system.cronRows].sort((a, b) => {
    if (sortBy === 'consecutiveErrors') return b.consecutiveErrors - a.consecutiveErrors
    return a[sortBy].localeCompare(b[sortBy])
  })

  return (
    <section className="space-y-5" title="System view highlights runtime health so issues are caught before they cascade.">
      <div className="grid gap-4 xl:grid-cols-3">
        {data.system.metrics.map((item) => (
          <article key={item.label} className="rounded-[28px] border border-white/8 bg-[#091120]/90 p-4">
            <p className="text-sm text-slate-400">{item.label}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{item.value}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
          </article>
        ))}
      </div>

      <article className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-semibold text-white">Cron reliability</h3>
          <div className="flex gap-2">
            {['Restart Gateway', 'Run Health Check', 'Clear Error Backoff'].map((action) => (
              <button key={action} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white">{action}</button>
            ))}
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
              {sortedRows.map((row) => (
                <tr key={row.id} className="border-t border-white/10 bg-[#070c17] text-slate-200">
                  <td className="px-3 py-2">
                    <p className="font-semibold text-white">{row.name}</p>
                    <p className="text-xs text-slate-500">{row.promptPreview}</p>
                  </td>
                  <td className="px-3 py-2">{row.status}</td>
                  <td className="px-3 py-2">{row.lastRun}</td>
                  <td className="px-3 py-2">{row.nextRun}</td>
                  <td className="px-3 py-2">{row.consecutiveErrors}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-end gap-1">{row.miniReliability.map((point, index) => <span key={`${row.id}-${index}`} className="w-1.5 rounded-sm bg-cyan-300/80" style={{ height: `${Math.max(8, Math.round(point / 3))}px` }} />)}</div>
                  </td>
                </tr>
              ))}
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

function SettingsView({ data, onReplayTour }: { data: MissionControlData; onReplayTour: () => void }) {
  return (
    <section className="grid gap-5 xl:grid-cols-2" title="Settings controls cadence, models, and routing so automation stays understandable.">
      <article className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Cadence controls</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Agent update frequency</h3>
        <fieldset className="mt-4 space-y-3 text-sm text-slate-200">
          <legend className="sr-only">Hex update frequency</legend>
          {data.settings.updateFrequencyOptions.map((option) => (
            <label key={option} className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <span>{option}</span>
              <input type="radio" name="hex-frequency" defaultChecked={option === data.settings.selectedFrequency} aria-label={option} />
            </label>
          ))}
        </fieldset>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">Morning brief time
            <input type="time" defaultValue={data.settings.morningBriefTime} className="mt-2 w-full rounded-lg border border-white/10 bg-[#070c17] px-2 py-1 text-white" />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">Warren market brief time
            <input type="time" defaultValue={data.settings.marketBriefTime} className="mt-2 w-full rounded-lg border border-white/10 bg-[#070c17] px-2 py-1 text-white" />
          </label>
        </div>
      </article>

      <article className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Routing + onboarding</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Models and notifications</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          {data.settings.modelOverrides.map((override) => (
            <label key={override.agent} className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{override.agent} model override</span>
              <select defaultValue={override.model} className="mt-2 w-full rounded-lg border border-white/10 bg-[#070c17] px-2 py-1 text-white">
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
        <button
          type="button"
          onClick={onReplayTour}
          className="mt-5 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/20"
        >
          Replay onboarding tour
        </button>
      </article>
    </section>
  )
}

function OnboardingTour({ onClose }: { onClose: () => void }) {
  const steps = [
    'Overview shows system health and a quick read of what matters now.',
    'Schedule visualizes cron cadence so you can see what runs and when.',
    'Agents explains who does what: Karl coordinates, Hex builds, Warren handles markets/ops.',
    'Portfolio is reserved for finance snapshots and risk posture.',
    'Projects tracks delivery status and current blockers.',
    'Memory captures overnight logs and continuity context.',
    'System exposes runtime health, source confidence, and local references.',
    'Settings controls update frequency, routing, and lets you replay this tour anytime.',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#0b1222] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">First-time tour</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Welcome to Mission Control</h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">OpenClaw runs background agents automatically. This dashboard makes the work visible in plain English.</p>
        <ol className="mt-5 space-y-2">
          {steps.map((step, index) => (
            <li key={step} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-slate-200">
              <span className="mr-2 text-cyan-200">{index + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
