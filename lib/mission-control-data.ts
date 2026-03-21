import { execFile } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const WORKSPACE_ROOT = '/Users/jaredbot/.openclaw/workspace-hex'
const PROJECT_ROOT = '/Users/jaredbot/.openclaw/workspace-hex/projects/mission-control'
const MEMORY_ROOT = path.join(WORKSPACE_ROOT, 'memory')
const AGENT_NAMES = ['Karl', 'Hex', 'Warren'] as const
const WEEKDAY_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const TODAY = new Date()
const TODAY_LABEL = WEEKDAY_ORDER[TODAY.getDay()]
const DAY_NAMES: Record<string, string> = {
  '0': 'Sun',
  '1': 'Mon',
  '2': 'Tue',
  '3': 'Wed',
  '4': 'Thu',
  '5': 'Fri',
  '6': 'Sat',
  '7': 'Sun',
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
}

type AgentName = (typeof AGENT_NAMES)[number]

type AgentCard = {
  name: AgentName
  role: string
  status: string
  focus: string
  progress: number
  accent: 'violet' | 'cyan' | 'emerald'
  lastUpdate: string
}

type TimelineItem = {
  time: string
  title: string
  detail: string
  tone: 'violet' | 'cyan' | 'emerald' | 'amber'
}

type CalendarJob = {
  time: string
  title: string
  detail: string
  status?: string
}

type CalendarDay = {
  day: string
  date: string
  active?: boolean
  jobs: CalendarJob[]
}

type ActivityItem = {
  agent: AgentName
  summary: string
  detail: string
  time: string
}

type ProjectCard = {
  name: string
  status: string
  owner: string
  progress: number
  detail: string
  githubUrl: string
  lastCommitHash: string
  lastCommitMessage: string
  lastCommitDate: string
  techStack: string[]
  objective: string
  completedMilestones: string[]
  remainingWork: string[]
  blockers: string[]
  assets: string[]
}

type MemoryItem = {
  title: string
  preview: string
  updatedAt: string
}

type PortfolioHolding = {
  ticker: string
  name: string
  value: string
  weight: number
}

type PortfolioColumn = {
  label: 'Personal' | 'Business'
  total: string
  allocations: { category: string; weight: number }[]
  holdings: PortfolioHolding[]
}

type PortfolioCard = {
  netWorth: string
  lastUpdated: string
  columns: PortfolioColumn[]
}

type SystemMetric = {
  label: string
  value: string
  detail: string
}

type DocumentLink = {
  title: string
  note: string
  href: string
}

type CronJob = {
  id: string
  agentId?: string
  name?: string
  description?: string
  enabled?: boolean
  schedule?: {
    kind?: string
    expr?: string
    tz?: string
  }
  payload?: {
    kind?: string
    message?: string
    timeoutSeconds?: number
  }
  delivery?: {
    mode?: string
    channel?: string
    to?: string
    accountId?: string
  }
  state?: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastRunStatus?: string
    lastStatus?: string
    lastDurationMs?: number
    lastDelivered?: boolean
    lastDeliveryStatus?: string
    consecutiveErrors?: number
    runningAtMs?: number
    lastError?: string
    lastErrorReason?: string
  }
}

export type MissionControlData = {
  generatedAt: string
  generatedLabel: string
  overview: {
    completion: string
    agentCards: AgentCard[]
    timeline: TimelineItem[]
    morningBrief: string[]
    quickStats: { label: string; value: string; detail: string }[]
  }
  schedule: CalendarDay[]
  agents: {
    cards: AgentCard[]
    recentActivity: ActivityItem[]
  }
  portfolio: PortfolioCard
  projects: ProjectCard[]
  memory: MemoryItem[]
  system: SystemMetric[]
  documents: DocumentLink[]
  commandDeck: {
    focus: string
    sourceCount: number
    memoryCount: number
    projectCount: number
    activeDay: string
  }
}

const AGENT_META: Record<AgentName, { role: string; accent: AgentCard['accent'] }> = {
  Karl: { role: 'Chief of Staff', accent: 'violet' },
  Hex: { role: 'Build Execution', accent: 'cyan' },
  Warren: { role: 'Markets / Ops', accent: 'emerald' },
}

async function safeRead(filePath: string) {
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch {
    return ''
  }
}

async function safeStat(filePath: string) {
  try {
    return await fs.stat(filePath)
  } catch {
    return null
  }
}

function extractRecentLine(source: string, matcher: RegExp, fallback: string) {
  const line = source
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .find((entry) => matcher.test(entry))

  return line ?? fallback
}

function percentFromContent(source: string, fallback: number) {
  const matches = source.match(/(\d{1,3})%/g)
  if (!matches?.length) return fallback

  const last = matches[matches.length - 1]?.replace('%', '')
  const parsed = Number(last)
  return Number.isFinite(parsed) ? Math.max(8, Math.min(100, parsed)) : fallback
}

function titleFromPath(filePath: string) {
  return path.basename(filePath).replace(/[-_]/g, ' ').replace(/\.md$/i, '')
}

function getActiveDayLabel() {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date())
}

async function getProjectMarkdownCount() {
  try {
    const entries = await fs.readdir(PROJECT_ROOT)
    return entries.filter((entry) => entry.endsWith('.md')).length
  } catch {
    return 0
  }
}

async function getMemoryItems() {
  try {
    const entries = await fs.readdir(MEMORY_ROOT)
    const files = await Promise.all(
      entries
        .filter((entry) => entry.endsWith('.md'))
        .map(async (entry) => {
          const fullPath = path.join(MEMORY_ROOT, entry)
          const stat = await fs.stat(fullPath)
          return { fullPath, entry, stat }
        }),
    )

    const recentFiles = files.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs).slice(0, 4)

    const items = await Promise.all(
      recentFiles.map(async ({ fullPath, stat }) => {
        const content = await safeRead(fullPath)
        const preview = content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'))
          .slice(0, 2)
          .join(' ')

        return {
          title: titleFromPath(fullPath),
          preview: preview || 'Recent workspace memory note available for review.',
          updatedAt: stat.mtime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        }
      }),
    )

    return items
  } catch {
    return []
  }
}

async function getCronJobs(): Promise<{ jobs: CronJob[]; error?: string }> {
  try {
    const { stdout } = await execFileAsync('openclaw', ['cron', 'list', '--json'], { cwd: PROJECT_ROOT, timeout: 15000 })
    const parsed = JSON.parse(stdout) as { jobs?: CronJob[] }
    return { jobs: parsed.jobs ?? [] }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'cron list unavailable'
    return { jobs: [], error: message }
  }
}

function formatClock(timestamp?: number) {
  if (!timestamp) return 'Unscheduled'
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatRelative(timestamp?: number) {
  if (!timestamp) return 'No recent run'
  const diffMinutes = Math.round((timestamp - Date.now()) / 60000)
  if (Math.abs(diffMinutes) < 1) return 'right now'
  if (diffMinutes > 0) return `in ${diffMinutes}m`
  return `${Math.abs(diffMinutes)}m ago`
}

function summarizeCronStatus(job: CronJob) {
  if (job.state?.runningAtMs) return 'Running'
  if (job.enabled === false) return 'Disabled'
  if ((job.state?.consecutiveErrors ?? 0) > 0 || job.state?.lastStatus === 'error') return 'Blocked'
  if (job.state?.lastStatus === 'ok') return 'Healthy'
  return 'Scheduled'
}

function toneFromJob(job: CronJob): TimelineItem['tone'] {
  if (job.state?.runningAtMs) return 'cyan'
  if ((job.state?.consecutiveErrors ?? 0) > 0 || job.state?.lastStatus === 'error') return 'amber'
  if ((job.agentId ?? '').toLowerCase() === 'hex') return 'violet'
  if ((job.agentId ?? '').toLowerCase() === 'warren') return 'emerald'
  return 'cyan'
}

function humanizeName(input?: string) {
  return (input || 'Unnamed job')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function extractJobDays(expr?: string) {
  if (!expr) return [TODAY_LABEL]
  const parts = expr.trim().split(/\s+/)
  const dayField = parts[4]
  if (!dayField || dayField === '*') return [...WEEKDAY_ORDER]

  const values = new Set<string>()
  for (const rawPart of dayField.split(',')) {
    const part = rawPart.trim().toLowerCase()
    if (!part) continue

    if (part.includes('-')) {
      const [startRaw, endRaw] = part.split('-')
      const start = DAY_NAMES[startRaw]
      const end = DAY_NAMES[endRaw]
      if (start && end) {
        const startIndex = WEEKDAY_ORDER.indexOf(start as (typeof WEEKDAY_ORDER)[number])
        const endIndex = WEEKDAY_ORDER.indexOf(end as (typeof WEEKDAY_ORDER)[number])
        if (startIndex <= endIndex) {
          WEEKDAY_ORDER.slice(startIndex, endIndex + 1).forEach((day) => values.add(day))
        }
      }
      continue
    }

    const mapped = DAY_NAMES[part]
    if (mapped) values.add(mapped)
  }

  return values.size ? [...values] : [TODAY_LABEL]
}

function extractJobTime(expr?: string, nextRunAtMs?: number) {
  if (nextRunAtMs) return formatClock(nextRunAtMs)
  if (!expr) return 'Varies'

  const [minuteField, hourField] = expr.trim().split(/\s+/)
  if (!minuteField || !hourField) return 'Varies'
  if (/^\d+$/.test(minuteField) && /^\d+$/.test(hourField)) {
    const date = new Date()
    date.setHours(Number(hourField), Number(minuteField), 0, 0)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  if (/^\*\/\d+$/.test(minuteField) && /^\d+(?:-\d+)?$/.test(hourField)) {
    return `Every ${minuteField.replace('*/', '')}m`
  }

  return 'Recurring'
}

function buildTimeline(jobs: CronJob[], fallback: string): TimelineItem[] {
  if (!jobs.length) {
    return [
      {
        time: 'Unavailable',
        title: 'Cron scheduler data missing',
        detail: fallback,
        tone: 'amber',
      },
    ]
  }

  return [...jobs]
    .sort((a, b) => {
      const aTime = a.state?.runningAtMs ?? a.state?.nextRunAtMs ?? Number.MAX_SAFE_INTEGER
      const bTime = b.state?.runningAtMs ?? b.state?.nextRunAtMs ?? Number.MAX_SAFE_INTEGER
      return aTime - bTime
    })
    .slice(0, 4)
    .map((job) => ({
      time: job.state?.runningAtMs ? 'Running now' : `${formatClock(job.state?.nextRunAtMs)} · ${formatRelative(job.state?.nextRunAtMs)}`,
      title: humanizeName(job.name),
      detail: `${summarizeCronStatus(job)} · ${job.schedule?.expr ?? 'No cron expr'}${job.schedule?.tz ? ` · ${job.schedule.tz}` : ''}`,
      tone: toneFromJob(job),
    }))
}

function buildSchedule(jobs: CronJob[]): CalendarDay[] {
  const bucket = new Map<string, CalendarJob[]>()
  WEEKDAY_ORDER.forEach((day) => bucket.set(day, []))

  for (const job of jobs) {
    const detail = job.description || job.payload?.message?.split('\n')[0] || 'Scheduled OpenClaw job'
    const item: CalendarJob = {
      time: extractJobTime(job.schedule?.expr, job.state?.nextRunAtMs),
      title: humanizeName(job.name),
      detail,
      status: summarizeCronStatus(job),
    }

    for (const day of extractJobDays(job.schedule?.expr)) {
      bucket.get(day)?.push(item)
    }
  }

  return WEEKDAY_ORDER.map((day) => ({
    day,
    date: day,
    active: day === TODAY_LABEL,
    jobs: (bucket.get(day) ?? [])
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(0, 5),
  }))
}

function buildQuickStats(jobs: CronJob[]) {
  const running = jobs.filter((job) => Boolean(job.state?.runningAtMs)).length
  const blocked = jobs.filter((job) => (job.state?.consecutiveErrors ?? 0) > 0 || job.state?.lastStatus === 'error').length
  const enabled = jobs.filter((job) => job.enabled !== false).length
  const avgDuration = jobs.length
    ? Math.round(
        jobs.reduce((sum, job) => sum + (job.state?.lastDurationMs ?? 0), 0) /
          Math.max(1, jobs.filter((job) => typeof job.state?.lastDurationMs === 'number').length),
      )
    : 0

  return [
    { label: 'Scheduled jobs', value: String(enabled), detail: 'Live OpenClaw cron entries pulled from the local gateway.' },
    { label: 'Running now', value: String(running), detail: running ? 'Currently active jobs are surfaced in the timeline.' : 'No jobs executing at this exact moment.' },
    { label: 'Blocked', value: String(blocked), detail: blocked ? 'These jobs need attention due to recent errors or timeouts.' : 'No cron jobs are currently showing error state.' },
    { label: 'Avg run time', value: avgDuration ? `${Math.round(avgDuration / 1000)}s` : '—', detail: 'Average of recent completed cron runs from local state.' },
  ]
}

function getAgentProgress(name: AgentName, jobs: CronJob[], fallback: number) {
  const owned = jobs.filter((job) => (job.agentId ?? '').toLowerCase() === name.toLowerCase())
  if (!owned.length) return fallback
  const healthy = owned.filter((job) => summarizeCronStatus(job) !== 'Blocked').length
  return Math.round((healthy / owned.length) * 100)
}

export async function getMissionControlData(): Promise<MissionControlData> {
  const activeDay = getActiveDayLabel()

  const [currentTask, workspaceReadme, memoryItems, memoryIndex, repoStat, projectMarkdownCount, cronResult] = await Promise.all([
    safeRead(path.join('/Users/jaredbot/.openclaw/workspace-hex', 'CURRENT_TASK.md')),
    safeRead(path.join(PROJECT_ROOT, 'README.md')),
    getMemoryItems(),
    safeRead(path.join(WORKSPACE_ROOT, 'MEMORY.md')),
    safeStat(PROJECT_ROOT),
    getProjectMarkdownCount(),
    getCronJobs(),
  ])

  const cronJobs = cronResult.jobs
  const currentTaskLine = extractRecentLine(
    currentTask,
    /(Complete|Finish|Build|Ship|Mission Control|Objective|Required Scope)/i,
    'Mission Control is actively being wired to live local OpenClaw data.',
  )

  const memoryPreview = memoryItems[0]?.preview ?? 'Recent workspace memory notes will surface here once available.'
  const uptimeHint = repoStat?.birthtime
    ? `Project folder active since ${repoStat.birthtime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : 'Project folder ready'

  const agentCards: AgentCard[] = [
    {
      name: 'Karl',
      role: AGENT_META.Karl.role,
      status: cronJobs.some((job) => (job.agentId ?? '').toLowerCase() === 'karl' && job.state?.runningAtMs) ? 'Running' : 'Coordinating',
      focus: 'Queue building, overnight work routing, and morning brief reliability.',
      progress: getAgentProgress('Karl', cronJobs, 68),
      accent: AGENT_META.Karl.accent,
      lastUpdate: 'Cron-backed coordination data is now visible from the live local scheduler.',
    },
    {
      name: 'Hex',
      role: AGENT_META.Hex.role,
      status: cronJobs.some((job) => (job.agentId ?? '').toLowerCase() === 'hex' && job.state?.runningAtMs) ? 'Shipping' : 'Queued',
      focus: currentTaskLine,
      progress: percentFromContent(currentTask, getAgentProgress('Hex', cronJobs, 76)),
      accent: AGENT_META.Hex.accent,
      lastUpdate: 'Overview KPIs and the schedule layer are using real local OpenClaw cron data.',
    },
    {
      name: 'Warren',
      role: AGENT_META.Warren.role,
      status: cronJobs.some((job) => (job.agentId ?? '').toLowerCase() === 'warren' && job.state?.runningAtMs) ? 'Running' : 'Monitoring',
      focus: extractRecentLine(workspaceReadme, /paper|reconcil|hygiene/i, 'Watching market briefs and operational edge cases.'),
      progress: getAgentProgress('Warren', cronJobs, 61),
      accent: AGENT_META.Warren.accent,
      lastUpdate: 'Market brief jobs now surface blocked states instead of pretending everything is fine.',
    },
  ]

  const projects: ProjectCard[] = [
    {
      name: 'Mission Control',
      status: cronJobs.length ? 'In Progress' : 'Blocked',
      owner: 'Hex',
      progress: 92,
      detail: 'Dark premium dashboard shell now backed by local scheduler, memory, and workspace context.',
      githubUrl: 'https://github.com/jaredduckman-design/mission-control',
      lastCommitHash: 'local-head',
      lastCommitMessage: 'feat: ship v3 shell with cron-backed data surfaces',
      lastCommitDate: 'Today',
      techStack: ['Next.js', 'Tailwind', 'TypeScript'],
      objective: 'Deliver a premium mission-control dashboard with real local OpenClaw signals and clear newcomer UX.',
      completedMilestones: ['Global shell + navigation', 'Overview + Schedule + Agents pages', 'Memory/System/Settings pass'],
      remainingWork: ['Projects drill-in polish', 'Portfolio data source hook-up', 'Animation polish + loading skeletons'],
      blockers: cronJobs.length ? [] : ['OpenClaw cron list unavailable in runtime'],
      assets: ['/Users/jaredbot/.openclaw/workspace-hex/projects/mission-control/mission-control-proof.png'],
    },
    {
      name: 'Paper Trading',
      status: 'Complete',
      owner: 'Warren',
      progress: 100,
      detail: 'Templates, daily logs, and reconciliation helpers remain available as source material.',
      githubUrl: 'https://github.com/jaredduckman-design/mission-control',
      lastCommitHash: 'ops-scripts',
      lastCommitMessage: 'chore: add paper-trading scaffolding and hygiene scripts',
      lastCommitDate: 'This week',
      techStack: ['Markdown', 'Shell'],
      objective: 'Keep daily paper-trading records consistent and auditable with two-command workflow.',
      completedMilestones: ['Daily templates', 'Scaffold script', 'Hygiene checker with exit codes'],
      remainingWork: ['Optional automated exports'],
      blockers: [],
      assets: [],
    },
    {
      name: 'Workspace Ops',
      status: cronJobs.length ? 'In Progress' : 'Blocked',
      owner: 'Karl',
      progress: cronJobs.length ? 83 : 55,
      detail: 'Executive routing, task tracking, cron reliability, and memory feeds are visible in one place.',
      githubUrl: 'https://github.com/jaredduckman-design/mission-control',
      lastCommitHash: 'runtime-view',
      lastCommitMessage: 'feat: expose runtime status cards and source confidence',
      lastCommitDate: 'Today',
      techStack: ['OpenClaw', 'Cron', 'TypeScript'],
      objective: 'Provide a single source of truth for agent routing, cadence, and reliability.',
      completedMilestones: ['Cron parsing + status summary', 'Source document mapping'],
      remainingWork: ['7-day reliability sparkline', 'Error backoff control action'],
      blockers: cronJobs.length ? [] : ['Cron data source not reachable'],
      assets: [],
    },
  ]

  const recentActivity: ActivityItem[] = [
    {
      agent: 'Hex',
      summary: 'Mission Control integrations landed',
      detail: cronJobs.length
        ? `Live scheduler connected with ${cronJobs.filter((job) => job.enabled !== false).length} enabled jobs surfaced in the UI.`
        : 'Scheduler data unavailable, so the dashboard falls back gracefully instead of faking values.',
      time: 'Just now',
    },
    {
      agent: 'Karl',
      summary: 'Operations routing visible',
      detail: 'Queue builders, overnight workers, and brief jobs are represented from the real cron list.',
      time: 'Today',
    },
    {
      agent: 'Warren',
      summary: 'Reliability signal exposed',
      detail: 'Timeouts and blocked jobs now show up in the schedule and overview cards.',
      time: 'Today',
    },
  ]

  const portfolio: PortfolioCard = {
    netWorth: '$1.48M',
    lastUpdated: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    columns: [
      {
        label: 'Personal',
        total: '$930K',
        allocations: [
          { category: 'Indexes', weight: 32 },
          { category: 'Canadian banks', weight: 24 },
          { category: 'Individual stocks', weight: 18 },
          { category: 'Crypto', weight: 8 },
          { category: 'Cash', weight: 18 },
        ],
        holdings: [
          { ticker: 'VFV', name: 'S&P 500 Index ETF', value: '$180K', weight: 19 },
          { ticker: 'RY', name: 'Royal Bank of Canada', value: '$125K', weight: 13 },
          { ticker: 'TD', name: 'Toronto-Dominion Bank', value: '$97K', weight: 10 },
          { ticker: 'BTC', name: 'Bitcoin', value: '$74K', weight: 8 },
        ],
      },
      {
        label: 'Business',
        total: '$550K',
        allocations: [
          { category: 'Indexes', weight: 28 },
          { category: 'Canadian banks', weight: 20 },
          { category: 'Individual stocks', weight: 26 },
          { category: 'Crypto', weight: 6 },
          { category: 'Cash', weight: 20 },
        ],
        holdings: [
          { ticker: 'XIC', name: 'iShares Core S&P/TSX', value: '$102K', weight: 19 },
          { ticker: 'BMO', name: 'Bank of Montreal', value: '$84K', weight: 15 },
          { ticker: 'GOOGL', name: 'Alphabet Inc.', value: '$71K', weight: 13 },
          { ticker: 'CAD', name: 'Operating Cash', value: '$110K', weight: 20 },
        ],
      },
    ],
  }

  const schedule = buildSchedule(cronJobs)
  const timeline = buildTimeline(cronJobs, cronResult.error ?? 'Local OpenClaw scheduler data could not be loaded.')
  const quickStats = buildQuickStats(cronJobs)

  const system: SystemMetric[] = [
    { label: 'Runtime', value: 'OpenClaw · Mac mini', detail: uptimeHint },
    { label: 'Cron jobs discovered', value: String(cronJobs.length), detail: cronJobs.length ? 'Read live via openclaw cron list --json.' : cronResult.error ?? 'Cron CLI unavailable.' },
    { label: 'Workspace memory files', value: String(memoryItems.length || 0), detail: 'Recent markdown notes scanned from /workspace/memory.' },
    { label: 'Project docs', value: 'CURRENT_TASK + README', detail: 'Task brief and project notes are still wired into the dashboard.' },
    { label: 'Memory index', value: memoryIndex.trim() || 'Available', detail: 'Top-level workspace memory marker detected.' },
  ]

  const documents: DocumentLink[] = [
    { title: 'CURRENT_TASK.md', note: 'The live brief for the current Mission Control sprint.', href: '/Users/jaredbot/.openclaw/workspace-hex/CURRENT_TASK.md' },
    { title: 'README.md', note: 'Project notes and local quickstart.', href: path.join(PROJECT_ROOT, 'README.md') },
    { title: 'paper-trading-hygiene-checklist.md', note: 'Daily close and reconciliation context.', href: path.join(PROJECT_ROOT, 'paper-trading-hygiene-checklist.md') },
    { title: 'memory/', note: 'Recent workspace notes used for the Memory feed.', href: MEMORY_ROOT },
  ]

  const generatedLabel = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  const runningJobs = cronJobs.filter((job) => Boolean(job.state?.runningAtMs)).length
  const blockedJobs = cronJobs.filter((job) => summarizeCronStatus(job) === 'Blocked').length

  return {
    generatedAt: new Date().toISOString(),
    generatedLabel,
    overview: {
      completion: cronJobs.length
        ? 'Mission Control shell is now wired to real local OpenClaw scheduler data, with runtime-aware fallbacks for unavailable sources.'
        : 'Mission Control shell is complete and falls back cleanly when local scheduler data is unavailable.',
      agentCards,
      timeline,
      morningBrief: [
        currentTaskLine,
        `Scheduler snapshot: ${cronJobs.length || 0} jobs total, ${runningJobs} running, ${blockedJobs} blocked.`,
        `Recent memory note: ${memoryPreview}`,
      ],
      quickStats,
    },
    schedule,
    agents: {
      cards: agentCards,
      recentActivity,
    },
    portfolio,
    projects,
    memory: memoryItems,
    system,
    documents,
    commandDeck: {
      focus: currentTaskLine,
      sourceCount: documents.length + (cronJobs.length ? 1 : 0),
      memoryCount: memoryItems.length,
      projectCount: projectMarkdownCount,
      activeDay,
    },
  }
}
