import Link from 'next/link'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { Typography } from '@mui/material'
import { styled } from '@mui/system'
import { Box } from '@mui/system'
import { truncateAddress } from '@nina-protocol/nina-internal-sdk/src/utils/truncateAddress'
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
        <Typography noWrap sx={{ cursor: 'pointer', pr: 0.1 }}>
          <a>{truncateAddress(collaboratorID)}</a>
        </Typography>
    </Link>
      </ResponsiveBox>
  )
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  py: 1,

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
