import React, { useContext, useState } from 'react'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { timeSince } from '../utils'
import { Button } from '@mui/material'
import useTheme from '@mui/material/styles/useTheme'

const PendingReleasesIndicator = ({ inHubs }) => {
  const { pendingReleases, removePendingRelease } = useContext(Release.Context)
  const [pendingReleasesOpen, setPendingReleasesOpen] = useState(true)
  const theme = useTheme()

  return (
    <PendingReleaseContainer inHubs={inHubs}>
      {Object.keys(pendingReleases || {}).length > 0 && (
        <>
          {Object.keys(pendingReleases || {}).map((key) => {
            const { artist, title, date, status } = pendingReleases[key]
            let statusMessage
            if (status === 'failed_solana') {
              statusMessage = `Your Release ${artist} - "${title}" is pending.`
            } else if (status === 'failed_solana') {
              statusMessage = `Your Release ${artist} - "${title}" failed to publish.`
            } else if (status === 'success') {
              statusMessage = `Your Release ${artist} - "${title}" was successfully published.`
            }
            return (
              <PendingRelease status={status}>
                <Box
                  onClick={() => setPendingReleasesOpen(!pendingReleasesOpen)}
                  style={{
                    textDecoration: 'underline',
                    color: `${
                      status === 'success'
                        ? theme.palette.darkGreen
                        : theme.palette.red
                    }`,
                  }}
                >
                  <Typography
                    variant="body1"
                    gutterBottom
                    style={{ color: 'inherit' }}
                    onClick={() => setPendingReleasesOpen(!pendingReleasesOpen)}
                  >
                    {`${statusMessage}`}
                  </Typography>

                  <Typography style={{ color: 'inherit' }} gutterBottom>
                    {pendingReleasesOpen
                      ? '(See Less Info)'
                      : '(See More Info)'}
                  </Typography>
                </Box>
                {pendingReleasesOpen && (
                  <Box style={{ paddingTop: '8px' }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Release Status:</strong>
                      {` ${status}`}
                    </Typography>
                    <Typography gutterBottom>
                      <strong>Time Since Published:</strong>
                      {` ${timeSince(Date.parse(date))}`}
                    </Typography>
                    {status === 'pending' && (
                      <>
                        <Typography variant="body1" gutterBottom>
                          You will not be able to create another Release until
                          it is no longer pending.
                        </Typography>
                        <Typography>
                          Please write{' '}
                          <a
                            style={{ textDecoration: 'underline' }}
                            href="mailto:contact@ninaprotocol.com"
                          >
                            contact@ninaprotocol.com
                          </a>{' '}
                          if your release is pending for more than 30 minutes.
                        </Typography>
                      </>
                    )}
                    {status === 'failed_solana' && (
                      <Typography gutterBottom>
                        It is safe to attempt to publish again.
                      </Typography>
                    )}
                    {(status === 'success' || status === 'failed_solana') && (
                      <Button
                        variant="outlined"
                        style={{ marginTop: 1, width: '100%' }}
                        onClick={() => removePendingRelease(key)}
                      >
                        Got it
                      </Button>
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

const PendingReleaseContainer = styled(Box)(({ inHubs }) => ({
  width: '500px',
  position: 'absolute',
  left: '50%',
  transform: `translate(-50%, ${inHubs ? '50%' : '0'})`,
  background: 'white',
  textAlign: 'left',
}))

const PendingRelease = styled(Box)(({ theme, status }) => ({
  border:
    status === 'success'
      ? `2px solid ${theme.palette.darkGreen}`
      : `2px solid ${theme.palette.red}`,
  padding: '15px',

  cursor: 'pointer',
}))

export default PendingReleasesIndicator
