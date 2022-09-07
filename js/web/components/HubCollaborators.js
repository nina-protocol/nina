import { Box } from '@mui/system'
import dynamic from 'next/dynamic'
import Link from 'next/link'
const HubCollaborators = ({ collabData }) => {
  return collabData.map((collab) => (
    <Box key={collab.id}>
      <HubCollaborator
        collaboratorLink={'https://ninaprotocol.com'}
        collaboratorID={collab.collaborator}
      />
    </Box>
  ))
}
const HubCollaborator = ({ collaboratorID, collaboratorLink }) => {
  return (
    <Box sx={{display: 'flex', flexDirection: 'row', m:1, p:1}}>
      <Link href={`/profiles/${collaboratorID}`}>
        <a>{collaboratorID}</a>
      </Link>
    </Box>
  )
}
export default HubCollaborators
