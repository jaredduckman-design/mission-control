import { promises as fs } from 'fs'
import path from 'path'

const WORKSPACE_ROOT = '/Users/jaredbot/.openclaw/workspace'
const PROJECT_ROOT = '/Users/jaredbot/.openclaw/workspace/mission-control'
const MEMORY_ROOT = path.join(WORKSPACE_ROOT, 'memory')
const AGENT_NAMES = ['Karl', 'Hex', 'Warren'] as const

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
}

type MemoryItem = {
  title: string
  preview: string
  updatedAt: string
}

type PortfolioCard = {
  label: string
  value: string
  detail: string
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
  portfolio: PortfolioCard[]
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

    const recentFiles = files
      .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs)
      .slice(0, 4)

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

export async function getMissionControlData(): Promise<MissionControlData> {
  const activeDay = getActiveDayLabel()

  const [currentTask, workspaceReadme, memoryItems, memoryIndex, repoStat, projectMarkdownCount] = await Promise.all([
    safeRead(path.join('/Users/jaredbot/.openclaw/workspace-hex', 'CURRENT_TASK.md')),
    safeRead(path.join(PROJECT_ROOT, 'README.md')),
    getMemoryItems(),
    safeRead(path.join(WORKSPACE_ROOT, 'MEMORY.md')),
    safeStat(PROJECT_ROOT),
    getProjectMarkdownCount(),
  ])

  const currentTaskLine = extractRecentLine(
    currentTask,
    /(Build|Ship|Mission Control|Objective|Required Scope)/i,
    'Mission Control v2 is actively being shaped into an execution dashboard.',
  )

  const memoryPreview = memoryItems[0]?.preview ?? 'Recent workspace memory notes will surface here once available.'
  const uptimeHint = repoStat?.birthtime
    ? `Project folder active since ${repoStat.birthtime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : 'Project folder ready'

  const agentCards: AgentCard[] = [
    {
      name: 'Karl',
      role: AGENT_META.Karl.role,
      status: 'Coordinating',
      focus: 'Routing priorities and waiting for milestone proof.',
      progress: 68,
      accent: AGENT_META.Karl.accent,
      lastUpdate: extractRecentLine(currentTask, /Karl|proof|Priority/i, 'Tracking proof and priority handoffs.'),
    },
    {
      name: 'Hex',
      role: AGENT_META.Hex.role,
      status: 'Shipping',
      focus: currentTaskLine,
      progress: percentFromContent(currentTask, 76),
      accent: AGENT_META.Hex.accent,
      lastUpdate: 'Building the dark-mode shell with real local workspace data where possible.',
    },
    {
      name: 'Warren',
      role: AGENT_META.Warren.role,
      status: 'Monitoring',
      focus: extractRecentLine(workspaceReadme, /paper|reconcil|hygiene/i, 'Watching paper-trading hygiene and close flow.'),
      progress: 61,
      accent: AGENT_META.Warren.accent,
      lastUpdate: 'Paper-trading templates and reconciliation notes remain available as data sources.',
    },
  ]

  const timeline: TimelineItem[] = [
    { time: '07:00', title: 'Morning brief', detail: memoryPreview, tone: 'cyan' },
    { time: '09:00', title: 'Mission Control sprint', detail: currentTaskLine, tone: 'violet' },
    { time: '13:30', title: 'Projects review', detail: 'Review active builds and progress snapshots across the workspace.', tone: 'emerald' },
    { time: '16:15', title: 'Close + reconcile', detail: 'Paper-trading hygiene check and system review placeholder.', tone: 'amber' },
  ]

  const schedule: CalendarDay[] = [
    {
      day: 'Mon',
      date: 'Mon',
      active: activeDay === 'Mon',
      jobs: [
        { time: '07:00', title: 'Morning brief', detail: 'Daily summary and memory scan' },
        { time: '09:30', title: 'Build block', detail: 'Focused execution window for product work' },
      ],
    },
    {
      day: 'Tue',
      date: 'Tue',
      active: activeDay === 'Tue',
      jobs: [
        { time: '08:30', title: 'Founder review', detail: 'Priority sweep with Karl' },
        { time: '12:00', title: 'Midday check', detail: 'Progress / blockers / approvals' },
      ],
    },
    {
      day: 'Wed',
      date: 'Wed',
      active: activeDay === 'Wed',
      jobs: [
        { time: '07:00', title: 'Morning brief', detail: 'Generated summary slot' },
        { time: '15:30', title: 'Proof review', detail: 'Milestone screenshots and commit evidence' },
      ],
    },
    {
      day: 'Thu',
      date: 'Thu',
      active: activeDay === 'Thu',
      jobs: [
        { time: '09:00', title: 'Mission Control sprint', detail: 'Navigation, data cards, and polish' },
        { time: '13:00', title: 'Portfolio review', detail: 'Scaffold portfolio holdings view' },
      ],
    },
    {
      day: 'Fri',
      date: 'Fri',
      active: activeDay === 'Fri',
      jobs: [
        { time: '07:30', title: 'Weekly wrap', detail: 'Leadership summary and next actions' },
        { time: '16:15', title: 'Close + reconcile', detail: 'Markets / ops placeholder review' },
      ],
    },
  ]

  const projects: ProjectCard[] = [
    {
      name: 'Mission Control',
      status: 'In build',
      owner: 'Hex',
      progress: 78,
      detail: 'Dark premium dashboard shell with seven execution views.',
    },
    {
      name: 'Paper Trading',
      status: 'Maintaining',
      owner: 'Warren',
      progress: 64,
      detail: 'Templates, daily logs, and reconciliation helpers live in this repo.',
    },
    {
      name: 'Workspace Ops',
      status: 'Scaffolded',
      owner: 'Karl',
      progress: 55,
      detail: 'Executive routing, current task tracking, and memory feeds.',
    },
  ]

  const recentActivity: ActivityItem[] = [
    {
      agent: 'Hex',
      summary: 'Mission Control UI refresh',
      detail: 'Converted the dashboard into a multi-view shell wired to local workspace data.',
      time: 'Just now',
    },
    {
      agent: 'Karl',
      summary: 'Delegation active',
      detail: 'CURRENT_TASK.md keeps the Mission Control objective and proof requirements explicit.',
      time: 'Today',
    },
    {
      agent: 'Warren',
      summary: 'Ops context available',
      detail: 'Paper-trading templates and hygiene docs are ready for future widgets.',
      time: 'Today',
    },
  ]

  const portfolio: PortfolioCard[] = [
    { label: 'Portfolio NAV', value: 'Placeholder', detail: 'Live holdings feed not wired yet — use this card as the target slot.' },
    { label: 'Risk posture', value: 'Moderate', detail: 'Manual scaffold until brokerage or ledger data exists.' },
    { label: 'Daily P/L', value: 'Pending', detail: 'Paper-trading docs exist locally, but no automated mark-to-market feed yet.' },
  ]

  const system: SystemMetric[] = [
    { label: 'Runtime', value: 'OpenClaw · Mac mini', detail: uptimeHint },
    { label: 'Workspace memory files', value: String(memoryItems.length || 0), detail: 'Recent markdown notes scanned from /workspace/memory' },
    { label: 'Project docs', value: 'CURRENT_TASK + README', detail: 'Task brief and project notes are wired into the dashboard' },
    { label: 'Build target', value: 'Vercel', detail: 'Ready for deployment once the UI milestone is accepted' },
    { label: 'Memory index', value: memoryIndex.trim() || 'Available', detail: 'Top-level workspace memory marker detected' },
  ]

  const documents: DocumentLink[] = [
    { title: 'CURRENT_TASK.md', note: 'The live brief for Mission Control v2.', href: '/Users/jaredbot/.openclaw/workspace-hex/CURRENT_TASK.md' },
    { title: 'README.md', note: 'Project notes and local quickstart.', href: path.join(PROJECT_ROOT, 'README.md') },
    { title: 'paper-trading-hygiene-checklist.md', note: 'Daily close and reconciliation context.', href: path.join(PROJECT_ROOT, 'paper-trading-hygiene-checklist.md') },
    { title: 'memory/', note: 'Recent workspace notes used for the Memory feed.', href: MEMORY_ROOT },
  ]

  const generatedLabel = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

  return {
    generatedAt: new Date().toISOString(),
    generatedLabel,
    overview: {
      completion: 'Milestone 1 shell implemented with production-style navigation, active-day scheduling, and real local context cards.',
      agentCards,
      timeline,
      morningBrief: [
        currentTaskLine,
        `Recent memory note: ${memoryPreview}`,
        'Next unlock: wire deeper cron / health data once the shell is approved.',
      ],
      quickStats: [
        { label: 'Views live', value: '7', detail: 'Overview, Schedule, Agents, Portfolio, Projects, Memory, System' },
        { label: 'Local sources', value: '4', detail: 'CURRENT_TASK, README, memory notes, paper-trading docs' },
        { label: 'Today', value: activeDay, detail: 'The active weekday is highlighted in the weekly schedule view' },
      ],
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
      sourceCount: documents.length,
      memoryCount: memoryItems.length,
      projectCount: projectMarkdownCount,
      activeDay,
    },
  }
}
