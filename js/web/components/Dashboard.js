import Profile from './Profile'
import { Box } from '@mui/material'
import {styled} from '@mui/system'
const Dashboard = (props) => {
  const { publicKey } = props
  return (
    <ResponsiveProfileContainer>
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
