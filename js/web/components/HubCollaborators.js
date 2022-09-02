import { Box } from '@mui/system'
import dynamic from 'next/dynamic'
const HubCollaborator = dynamic(() => import('./HubCollaborator'))
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

export default HubCollaborators
