import { Box } from '@mui/system'
import Link from 'next/link'
const ProfileHubs = ({ profileHubs }) => {
 if (profileHubs.length === 0) return <Box>No hubs belong to this address</Box>
  return profileHubs.map((hub) => (
    <Box key={hub.handle}>
      <ProfileHub
        hubHandle={hub.handle}
        hubName={hub.json.displayName}
      />
    </Box>
  ))
}
const ProfileHub = ({ hubHandle, hubName }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', m: 1, p: 1, justifyContent: 'center', textAlign:'center'}}>
      <Link href={`/hubs/${hubHandle}`} passHref prefetch>
        <a>{`${hubName}`}</a>
      </Link>
    </Box>
  )
}
export default ProfileHubs
