import { Box } from '@mui/system'
import Link from 'next/link'
const ProfileHubs = ({ profileHubs }) => {
 if (profileHubs.length === 0) return <Box>No hubs belong to this address</Box>
  return profileHubs.map((hub) => (
    <Box key={hub.handle}>
      <ProfileHub
        hubUrl={hub.json.externalUrl}
        hubName={hub.json.displayName}
      />
    </Box>
  ))
}
const ProfileHub = ({ hubUrl, hubName }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', m: 1, p: 1 }}>
      <Link href={`${hubUrl ? hubUrl : ''}`} passHref>
        <a target="_blank" rel="noopener noreferrer">{`${hubName}`}</a>
      </Link>
    </Box>
  )
}
export default ProfileHubs
