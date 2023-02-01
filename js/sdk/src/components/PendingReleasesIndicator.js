import React, { useContext, useState } from 'react'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { timeSince } from '../utils'

const PendingReleasesIndicator = () => {
  const { pendingReleases, removePendingRelease } = useContext(Release.Context)
  const [pendingReleasesOpen, setPendingReleasesOpen] = useState(false)

  return (
    <StyledBox>
      {Object.keys(pendingReleases || {}).length > 0 && (
        <>
          {Object.keys(pendingReleases || {}).map((key) => {
            const { artist, title, date, status } = pendingReleases[key]
            let statusMessage
            if (status === 'pending') {
              statusMessage = `Your release ${artist} - "${title}" is pending.`
            } else if (status === 'failed_solana') {
              statusMessage = `Your release ${artist} - "${title}" failed to publish.`
            } else if (status === 'success') {
              statusMessage = `Your release ${artist} - "${title}" was successfully published.`
            }
            return (
              <PendingRelease style={{ border: `${status === 'success' ? '1px solid green' : '1px solid red' }`}}>
                <Typography style={{ textDecoration: 'underline', color: `${status === 'success' ? 'green' : 'red'}`}} onClick={() => setPendingReleasesOpen(!pendingReleasesOpen)}>{`${statusMessage}  ${pendingReleasesOpen ? '(See Less Info)' : '(See More Info)'}`}</Typography>
                {pendingReleasesOpen && (
                  <Box style={{ paddingTop: '8px'}}>
                    <Typography>{`Release Status: ${status}`}</Typography>
                    <Typography>{`Time Since Published: ${timeSince(Date.parse(date))}`}</Typography>
                    {status === 'pending' && (
                      <>
                        <Typography>You will not be able to publish another release until it is no longer pending.</Typography>
                        <Typography style={{ paddingTop: '8px'}}>Please write <a style={{ textDecoration: 'underline'}} href="mailto:contact@ninaprotocol.com">contact@ninaprotocol.com</a> if your release is pending for more than 30 minutes.</Typography>
                      </>
                    )}
                    {status === 'failed_solana' && (
                      <Typography>It is safe to attempt to publish again.</Typography>
                    )}
                    {(status === 'success' || status === 'failed_solana') && (
                      <button onClick={() => removePendingRelease(key)}>Got it!</button>
                    )}
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
  padding: '10px',
  position: 'inherit',
  background: 'white',
  width: '765px',
  cursor: 'pointer',
}))

export default PendingReleasesIndicator