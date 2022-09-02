import { Box } from '@mui/system'
import Link from 'next/link'
const HubCollaborator = ({ collaboratorID, collaboratorLink }) => {
  return (
    <Box sx={{display: 'flex', flexDirection: 'row', m:1, p:1}}>
      <Link href={collaboratorLink}>
        <a>{collaboratorID}</a>
      </Link>
    </Box>
  )
}

export default HubCollaborator
