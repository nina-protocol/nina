import dynamic from 'next/dynamic'
const DashboardWelcome = dynamic(() => import('./DashboardWelcome'))
const Profile = dynamic(() => import('./Profile'))
const Dashboard = (props) => {
  const { publicKey } = props
  return (
    <>
      <DashboardWelcome
        userHasSeenUpdateMessage={localStorage.getItem(
          'nina-dashboard-welcome-message'
        )}
      />
      <Profile profilePubkey={publicKey} />
    </>
  )
}

export default Dashboard
