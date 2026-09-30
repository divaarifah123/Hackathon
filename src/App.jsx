import Sidebar from './components/Sidebar.jsx'
import { useRoute } from './lib/router.js'
import Dashboard from './pages/Dashboard.jsx'
import Appointments from './pages/Appointments.jsx'
import CallDetail from './pages/CallDetail.jsx'
import OwnerAlerts from './pages/OwnerAlerts.jsx'
import Settings from './pages/Settings.jsx'

const PAGES = {
  dashboard: Dashboard,
  appointments: Appointments,
  calls: CallDetail,
  alerts: OwnerAlerts,
  settings: Settings,
}

export default function App() {
  const { page, params } = useRoute()
  const Page = PAGES[page] || Dashboard
  return (
    <div className="app">
      <Sidebar active={page} />
      <main className="main">
        <Page key={[page, ...params].join("/")} params={params} />
      </main>
    </div>
  )
}
