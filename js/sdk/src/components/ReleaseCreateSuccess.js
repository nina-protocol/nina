import React, { useContext, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import NinaBox from './NinaBox'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { Typography } from '@mui/material'
import Button from '@mui/material/Button'
import { useRouter } from 'next/router'
import ShareToTwitter from './ShareToTwitter'
import Release from '../contexts/Release'
import GateCreateModal from './GateCreateModal'
import Link from 'next/link'
const ReleaseCreateSuccess = (props) => {
  const router = useRouter()
  const {
    hubHandle,
    inHubs,
    releasePubkey,
    hubReleaseKey,
    artist,
    title,
    url,
    image,
  } = props
  const { fetchGatesForRelease, gatesState } = useContext(Release.Context)
  const releaseGates = useMemo(
    () => gatesState[releasePubkey],
    [gatesState, releasePubkey]
  )

  return (
    <>
      <ReleaseSuccessContainer>
       <Box sx={}>

        <Typography variant="h4" align="left">
          bahdbsasfhkasdgfasgfkadhas been created.
        </Typography>
        <ReleaseSuccessBox columns={'repeat(2, 1fr)'}>
          <img
            src={`https://arweave.net/${image}`}
            width={'300px'}
            height={'300px'}
          />
          </Box>
          <Box
            sx={{
              margin: 'auto',
              width: 'calc(100% - 50px)',
              paddingLeft: '50px',
            }}
          >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <ShareToTwitter artist={artist} title={title} url={url} />
            <GateCreateModal
              fetchGatesForRelease={fetchGatesForRelease}
              name={`${artist} - ${title}`}
              releasePubkey={releasePubkey}
              gates={releaseGates}
            />
            <Button
              fullWidth
              variant="outlined"
              sx={{ height: '54px', mt: 1, '&:hover': { opacity: '50%' } }}
            >
              <Link
                href={
                  inHubs
                    ? `/${hubHandle}/releases/${hubReleaseKey}`
                    : `/${releasePubkey?.toBase58()}`
                }
              >
                <a>
                  <Typography variant="body2" align="left">
                    View Release
                  </Typography>
                </a>
              </Link>
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{ height: '54px', mt: 1, '&:hover': { opacity: '50%' } }}
            >
              <Link
                href={
                  inHubs
                    ? `/${hubHandle}/dashboard?action=publishRelease`
                    : `/upload`
                }
              >
                <a>
                  <Typography variant="body2" align="left">
                    Create Another Release
                  </Typography>
                </a>
              </Link>
            </Button>
          </Box>
          </Box>
        </ReleaseSuccessBox>
      </ReleaseSuccessContainer>
    </>
  )
}
const ReleaseSuccessContainer = styled(Box)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}))

const ReleaseSuccessBox = styled(Box)(() => ({
  display: 'grid',
  width: '765px',
  minHeight: '547px',
  margin: 'auto',
  gridTemplateColumns:  'repeat(2, 1fr)',
  gridColumnGap: '0px',
  gridAutoRows: 'auto',
}))

export default ReleaseCreateSuccess
