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

  const releaseCreateRerouteHandler = (inHubs) => {
    if (inHubs) {
      router.push(`/${hubHandle}/releases/${hubReleaseKey}`)
    } else {
      router.push(`/${releasePubkey.toBase58()}`)
    }
  }

  return (
    <StyledGrid item md={12}>
      <NinaBox>
        <HubSuccessWrapper>
          <Typography variant="h1" sx={{ paddingBottom: '16px' }}>
            Your release was created.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <img
              src={`https://arweave.net/${image}`}
              width={'200px'}
              height={'200px'}
            />
            <Typography variant="h2" sx={{ paddingLeft: '16px' }}>
              {artist} - {title}
            </Typography>
          </Box>

          <Box sx={{ paddingTop: '32px' }}>
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
              onClick={() => releaseCreateRerouteHandler(inHubs)}
              sx={{ height: '54px', mt: 1, '&:hover': { opacity: '50%' } }}
            >
              <Typography variant="body2" align="left">
                View Release
              </Typography>
            </Button>
          </Box>
        </HubSuccessWrapper>
      </NinaBox>
    </StyledGrid>
  )
}
const StyledGrid = styled(Grid)(({ theme }) => ({
  paddingTop: '20px',
  maxHeight: '90vh',
  overflowY: 'scroll',
  justifyContent: 'center',
  alignItems: 'center',
  '& a': {
    textDecoration: 'none',
    color: theme.palette.blue,
    '&:hover': {
      opacity: '85%',
    },
  },
}))

const HubSuccessWrapper = styled(Box)(() => ({
  width: '100%',

  margin: '0px auto ',
  display: 'flex',
  flexDirection: 'column',
  gridColumn: '1/3',

  maxWidth: '506px',
  textAlign: 'left',
  paddingLeft: '16px',
  paddingRight: '16px',
}))

export default ReleaseCreateSuccess
