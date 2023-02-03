import React, { useContext, useState } from 'react'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { timeSince } from '../utils'
import { Button } from '@mui/material'

const PendingReleasesIndicator = () => {
  const { pendingReleases, removePendingRelease } = useContext(Release.Context)
  const [pendingReleasesOpen, setPendingReleasesOpen] = useState(true)
  console.log('pendingReleases :>> ', pendingReleases);
  return (
    <PendingReleaseContainer >
      {Object.keys(pendingReleases || {}).length > 0 && (
        <>
          {Object.keys(pendingReleases || {}).map((key) => {
            // const { artist, title, date, status } = pendingReleases[key]
            const { artist, title, date } = pendingReleases[key]
            const status = 'success'
            let statusMessage
            if (status === 'pending') {
              statusMessage = `Your release ${artist} - "${title}" is pending.`
            } else if (status === 'failed_solana') {
              statusMessage = `Your release ${artist} - "${title}" failed to publish.`
            } else if (status === 'success') {
              statusMessage = `Your release ${artist} - "${title}" was successfully published.`
            }
            return (
              <PendingRelease status={status}>
                <Typography variant='body1' style={{ textDecoration: 'underline', color: `${status === 'success' ? 'green' : 'red'}`}} onClick={() => setPendingReleasesOpen(!pendingReleasesOpen)}>{`${statusMessage}  ${pendingReleasesOpen ? '(See Less Info)' : '(See More Info)'}`}</Typography>
                {pendingReleasesOpen && (
                  <Box style={{ paddingTop: '8px'}}>
                    <Typography variant='body1' gutterBottom>{`Release Status: ${status}`}</Typography>
                    <Typography gutterBottom>{`Time Since Published: ${timeSince(Date.parse(date))}`}</Typography>
                    {status === 'pending' && (
                      <>
                        <Typography variant='body1' gutterBottom>You will not be able to publish another release until it is no longer pending.</Typography>
                        <Typography>Please write <a style={{ textDecoration: 'underline'}} href="mailto:contact@ninaprotocol.com">contact@ninaprotocol.com</a> if your release is pending for more than 30 minutes.</Typography>
                      </>
                    )}
                    {status === 'failed_solana' && (
                      <Typography gutterBottom>It is safe to attempt to publish again.</Typography>
                    )}
                    {(status === 'success' || status === 'failed_solana') && (
                      <Button variant="outlined" style={{maringTop: 1, width: '100%'}} onClick={() => removePendingRelease(key)}>Got it</Button>
                    )}
                  </Box>
                )}
              </PendingRelease>
            )
          })}
        </>
      )}
    </PendingReleaseContainer>
  )
}

const PendingReleaseContainer = styled(Box)(({ theme, status }) => ({
  width: '500px',
  position: 'absolute',
  left: '50%',
  transform: 'translate(-50%, 0)',
  background: 'white',


}))

const PendingRelease = styled(Box)(({status}) => ({
  // padding: '10px',
  // position: 'inherit',
  // background: 'white',
  // width: '765px',
  border: status === 'success' ? '2px solid green' : '2px solid red',
  padding: '15px',

  cursor: 'pointer',
}))

export default PendingReleasesIndicator