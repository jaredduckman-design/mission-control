import { MissionControlDashboard } from '../components/mission-control-dashboard'
import { getMissionControlData } from '../lib/mission-control-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Page() {
  const data = await getMissionControlData()

  return <MissionControlDashboard data={data} />
}
