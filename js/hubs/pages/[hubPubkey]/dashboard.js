import Dashboard from '../../components/Dashboard'

const DashboardPage = () => {
  return <Dashboard hubPubkey={process.env.REACT_HUB_PUBLIC_KEY} />
}
export default DashboardPage
