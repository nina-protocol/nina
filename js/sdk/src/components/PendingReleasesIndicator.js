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
        <>
          {Object.keys(pendingReleases).map((key) => {
            const { artist, title, solanaReleaseExists, ninaReleaseExists, date } = pendingReleases[key]
            let status = 0
            if (solanaReleaseExists && !ninaReleaseExists) {
              status = 1
            } else if (solanaReleaseExists && ninaReleaseExists) {
              status = 2
            }
            return (
              <PendingRelease>
                <Typography style={{ textDecoration: 'underline', color: 'red'}} onClick={() => setPendingReleasesOpen(!pendingReleasesOpen)}>{`Your release ${artist} - "${title}" is pending.  ${pendingReleasesOpen ? '(See Less Info)' : '(See More Info)'}`}</Typography>
                {pendingReleasesOpen && (
                  <Box style={{ paddingTop: '8px'}}>
                    <Typography>{`Pending Release Status: ${status}`}</Typography>
                    <Typography>{`Time Pending: ${timeSince(Date.parse(date))}`}</Typography>
                    <Typography>You will not be able to publish another release until it is no longer pending.</Typography>
                    <Typography style={{ paddingTop: '8px'}}>Please write <a style={{ textDecoration: 'underline'}} href="mailto:contact@ninaprotocol.com">contact@ninaprotocol.com</a> if your release is pending for more than 30 minutes.</Typography>
                  </Box>
                )}
              </PendingRelease>
            )
          })}
        </>
      )}
    </StyledBox>
  )
}

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop,
})(({ theme, columns, justifyItems, gridColumnGap }) => ({
  ...theme.helpers.grid,
  justifyItems: justifyItems ? justifyItems : 'center',
  paddingTop: '8px',
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

const PendingRelease = styled(Box)(() => ({
  border: '1px solid red',
  padding: '10px',
  position: 'inherit',
  background: 'white',
  width: '765px',
  cursor: 'pointer',
}))

export default PendingReleasesIndicator