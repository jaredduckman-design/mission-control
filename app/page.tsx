import { MissionControlDashboard } from '../components/mission-control-dashboard'
import { getMissionControlData } from '../lib/mission-control-data'

export default async function Page() {
  const data = await getMissionControlData()

  return <MissionControlDashboard data={data} />
}
