import React, { useContext, useState } from 'react'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { timeSince } from '../utils'

const PendingReleasesIndicator = () => {
  const { pendingReleases } = useContext(Release.Context)
  const [pendingReleasesOpen, setPendingReleasesOpen] = useState(false)

  return (
    <StyledBox>
      {Object.keys(pendingReleases).length > 0 && (
        <PendingReleases>
          <Typography style={{ textDecoration: 'underline', color: 'red'}} onClick={() => setPendingReleasesOpen(!pendingReleasesOpen)}>{`You have ${Object.keys(pendingReleases).length} pending release${Object.keys(pendingReleases).length > 1 ? 's' : ''}.  ${pendingReleasesOpen ? '(See Less Info)' : '(See More Info)'}`}</Typography>
          {pendingReleasesOpen && (
            <table>
            <thead>
              <tr>
                <th>Artist</th>
                <th>Title</th>
                <th>Release Account</th>
                <th>Metadata</th>
                <th>Published</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(pendingReleases).map((key) => {
                const release = pendingReleases[key]
                return (
                  <tr key={key}>
                    <td>{release.artist}</td>
                    <td>{release.title}</td>
                    <td>{release.solanaReleaseExists ? 'YES' : 'NO'}</td>
                    <td>{release.ninaReleaseExists ? 'YES' : 'NO'}</td>
                    <td>{`${timeSince(Date.parse(release.date))} Ago`}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              Please write contact@ninaprotocol.com if your release is pending for over 30 minutes.
            </tfoot>
          </table>
          )}
        </PendingReleases>
      )}
    </StyledBox>
  )
}

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop,
})(({ theme, columns, justifyItems, gridColumnGap }) => ({
  ...theme.helpers.grid,
  justifyItems: justifyItems ? justifyItems : 'center',
  paddingTop: '10px',
  width: '765px',
  margin: 'auto',
  gridTemplateColumns: columns ? columns : 'repeat(2, 1fr)',
  gridColumnGap: gridColumnGap ? gridColumnGap : '0px',
  gridAutoRows: 'auto',
  backgroundColor: `${theme.palette.white} !important`,
  [theme.breakpoints.down('md')]: {
    width: '80vw',
    margin: '140px auto',
    display: 'flex',
    flexDirection: 'column',
  },
  [theme.breakpoints.down('sm')]: {
    margin: '0px auto',
  },
}))

const PendingReleases = styled(Box)(() => ({
  border: '1px solid red',
  padding: '10px',
  position: 'inherit',
  background: 'white',
  width: '765px',
}))

export default PendingReleasesIndicator