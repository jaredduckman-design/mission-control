'use client'

import { useMemo, useState } from 'react'
import type { MissionControlData } from '../lib/mission-control-data'

const navItems = ['Overview', 'Schedule', 'Agents', 'Portfolio', 'Projects', 'Memory', 'System'] as const

type View = (typeof navItems)[number]

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

function accentClasses(accent: 'violet' | 'cyan' | 'emerald') {
  switch (accent) {
    case 'violet':
      return 'bg-violet-400 shadow-[0_0_24px_rgba(167,139,250,0.8)]'
    case 'cyan':
      return 'bg-cyan-300 shadow-[0_0_24px_rgba(103,232,249,0.8)]'
    case 'emerald':
      return 'bg-emerald-300 shadow-[0_0_24px_rgba(110,231,183,0.8)]'
  }
}

export function MissionControlDashboard({ data }: { data: MissionControlData }) {
  const [activeView, setActiveView] = useState<View>('Overview')

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
                  <span>{item}</span>
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

              <div className="grid gap-3 sm:grid-cols-3">
                {data.overview.quickStats.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                  </div>
                ))}
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
        </section>
      </div>
    </main>
  )
}

function OverviewView({ data }: { data: MissionControlData }) {
  return (
    <section className="grid gap-5 2xl:grid-cols-[1.2fr_0.9fr]">
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
            {data.overview.agentCards.map((agent) => (
              <article key={agent.name} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${accentClasses(agent.accent)}`} />
                      <p className="text-lg font-semibold text-white">{agent.name}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{agent.role}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-100">{agent.status}</span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-200">{agent.focus}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">Last update</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{agent.lastUpdate}</p>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(125,211,252,1),rgba(52,211,153,1))]" style={{ width: `${agent.progress}%` }} />
                </div>
              </article>
            ))}
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
    <section className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
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
              {day.jobs.map((job) => (
                <div key={`${day.day}-${job.time}-${job.title}`} className="rounded-3xl border border-white/8 bg-[#070c17] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">{job.time}</p>
                  <p className="mt-2 text-base font-semibold text-white">{job.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{job.detail}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function AgentsView({ data }: { data: MissionControlData }) {
  return (
    <section className="grid gap-5 2xl:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-4 xl:grid-cols-3">
        {data.agents.cards.map((agent) => (
          <article key={agent.name} className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${accentClasses(agent.accent)}`} />
              <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
            </div>
            <p className="mt-2 text-sm text-slate-400">{agent.role}</p>
            <p className="mt-4 text-sm leading-7 text-slate-200">{agent.focus}</p>
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Status</span>
                <span className="text-white">{agent.status}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(125,211,252,1),rgba(52,211,153,1))]" style={{ width: `${agent.progress}%` }} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{agent.lastUpdate}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Recent activity</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Latest motion</h3>
        <div className="mt-5 space-y-3">
          {data.agents.recentActivity.map((item) => (
            <article key={`${item.agent}-${item.summary}`} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-white">{item.summary}</p>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.time}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{item.agent}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function PortfolioView({ data }: { data: MissionControlData }) {
  return (
    <section className="grid gap-5 xl:grid-cols-3">
      {data.portfolio.map((item) => (
        <article key={item.label} className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <p className="text-sm text-slate-400">{item.label}</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{item.value}</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">{item.detail}</p>
        </article>
      ))}
    </section>
  )
}

function ProjectsView({ data }: { data: MissionControlData }) {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      {data.projects.map((project) => (
        <article key={project.name} className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-white">{project.name}</h3>
              <p className="mt-2 text-sm text-slate-400">Owner · {project.owner}</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-100">{project.status}</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">{project.detail}</p>
          <div className="mt-5 h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(125,211,252,1),rgba(52,211,153,1))]" style={{ width: `${project.progress}%` }} />
          </div>
          <p className="mt-3 text-sm text-slate-300">{project.progress}% complete</p>
        </article>
      ))}
    </section>
  )
}

function MemoryView({ data }: { data: MissionControlData }) {
  return (
    <section className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="grid gap-4 xl:grid-cols-2">
        {data.memory.length ? (
          data.memory.map((item) => (
            <article key={`${item.title}-${item.updatedAt}`} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/70">{item.updatedAt}</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.preview}</p>
            </article>
          ))
        ) : (
          <article className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.02] p-6 text-sm leading-7 text-slate-300 xl:col-span-2">
            No workspace memory notes were found yet. Once `/workspace/memory/*.md` gets populated, this view becomes a real continuity feed instead of a placeholder.
          </article>
        )}
      </div>
    </section>
  )
}

function SystemView({ data }: { data: MissionControlData }) {
  return (
    <section className="grid gap-5 2xl:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-4 xl:grid-cols-2">
        {data.system.map((item) => (
          <article key={item.label} className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <p className="text-sm text-slate-400">{item.label}</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{item.value}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Reference documents</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Known local sources</h3>
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-400">Generated</p>
              <p className="mt-2 font-semibold text-white">{data.generatedLabel}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Source count</p>
              <p className="mt-2 font-semibold text-white">{data.commandDeck.sourceCount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Memory files</p>
              <p className="mt-2 font-semibold text-white">{data.commandDeck.memoryCount}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {data.documents.map((item) => (
            <article key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-white">{item.title}</p>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Local</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.note}</p>
              <p className="mt-3 break-all text-xs text-slate-500">{item.href}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
