import Link from 'next/link'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

const HubCollaborators = ({ collabData }) => {
  return (
    <TableContainer component={Paper}>
      <Table  aria-label="simple table">
       
        <TableBody>
          {collabData.map((collab) => (
            <TableRow hover key={collab.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell component="th" scope="row">
              <HubCollaborator
                collaboratorLink={'https://ninaprotocol.com'}
                collaboratorID={collab.collaborator}
              />
            </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
const HubCollaborator = ({ collaboratorID,  }) => {
  return (
    
      <Link href={`/profiles/${collaboratorID}`}>
        <a>{collaboratorID}</a>
      </Link>
    
  )
}
export default HubCollaborators
