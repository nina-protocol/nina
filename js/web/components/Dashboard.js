import Profile from './Profile'
import { Box } from '@mui/material'
import { styled } from '@mui/system'
import dynamic from 'next/dynamic'
const DashboardWelcome = dynamic(() => import('./DashboardWelcome'))
const Dashboard = (props) => {
  const { publicKey } = props
  return (
    <ResponsiveProfileContainer>
      <DashboardWelcome
        userHasSeenUpdateMessage={localStorage.getItem(
          'nina-dashboard-welcome-message'
        )}
      />
      <Profile profilePubkey={publicKey} />
    </ResponsiveProfileContainer>
  )
}
const ResponsiveProfileContainer = styled(Box)(({ theme }) => ({
  width: theme.maxWidth,

  [theme.breakpoints.down('md')]: {
    minHeight: '40vh',
    padding: '0',
  },
}))
export default Dashboard
