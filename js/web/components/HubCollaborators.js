import Link from 'next/link'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { Typography } from '@mui/material'
import { styled } from '@mui/system'
import { Box } from '@mui/system'
const HubCollaborators = ({ collabData }) => {
  return (
    <ResponsiveContainer>
      <TableContainer>
        <Table>
          <TableBody sx={{ borderBottom: 'none' }}>
            {collabData.map((collab) => (
              <TableRow hover key={collab.id} sx={{overflow: 'visible'}}>
                <StyledTableCell align="left">
                  <HubCollaborator
                    collaboratorLink={'https://ninaprotocol.com'}
                    collaboratorID={collab.collaborator}
                  />
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ResponsiveContainer>
  )
}
const HubCollaborator = ({ collaboratorID }) => {
  return (
      <ResponsiveBox
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
    <Link href={`/profiles/${collaboratorID}`}>
        <Typography noWrap sx={{ cursor: 'pointer', pl: 0.1, pr: 0.1 }}>
          <a>{collaboratorID}</a>
        </Typography>
    </Link>
      </ResponsiveBox>
  )
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  p: 1,

}))

const ResponsiveContainer = styled(Box)(({ theme }) => ({
  width: '960px',
  minHeight: '50vh',
  [theme.breakpoints.down('md')]: {
    width: '100vw',
    maxHeight: '80vh',
  },
}))

const ResponsiveBox = styled(Box)(({theme}) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw'
  }
}))

export default HubCollaborators
