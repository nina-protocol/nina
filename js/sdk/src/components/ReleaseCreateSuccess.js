import React, { useMemo, useContext } from 'react'
import { styled } from '@mui/material/styles'
import NinaBox from './NinaBox'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { Typography } from '@mui/material'
import Button from '@mui/material/Button'
import { useRouter } from 'next/router'
import ShareToTwitter from './SharetoTwitter'
import Gates from './Gates'
import Release from '../contexts/Release'

const ReleaseCreateSuccess = (props) => {
  const router = useRouter()
  const { fetchGatesForRelease, gatesState } = useContext(Release.Context)

  const { hubHandle, inHubs, releasePubkey } = props
  const releaseGates = useMemo(
    () => gatesState[releasePubkey],
    [gatesState, releasePubkey]
  )
  // const successCopy = inHubs
  //   ? {
  //       primary: `/${hubHandle}`,
  //       secondary: `https://ninaprotocol.com/hubs/${hubHandle}`,
  //       primaryString: `hubs.ninaprotocol.com/${hubHandle}`,
  //       secondaryString: `ninaprotocol.com/hubs/${hubHandle}`,
  //       primaryDescription: `  A customizable page that exclusively surfaces your
  //                   content.`,
  //       secondaryDescription: `This is where your Hub can be found on `,
  //       primaryHyperlink: undefined,
  //       secondaryHyperlink: `ninaprotocol.com`,
  //     }
  //   : {
  //       primary: `/hubs/${hubHandle}`,
  //       secondary: `${process.env.NINA_HUBS_URL}/${hubHandle}`,
  //       primaryString: `ninaprotocol.com/hubs/${hubHandle}`,
  //       secondaryString: `hubs.ninaprotocol.com/${hubHandle}`,
  //       primaryDescription: `This is where your Hub can be found on `,
  //       secondaryDescription: `  A customizable page that exclusively surfaces your
  //                   content.`,
  //       primaryHyperlink: `ninaprotocol.com`,
  //       secondaryHyperlink: undefined,
  //     }

  const releaseCreateRerouteHandler = (inHubs) => {
    if (inHubs) {
      router.push(`/${hubHandle}/releases/${releasePubkey}`)
    } else {
      router.push(`/${releasePubkey}`)
    }
  }

  return (
    <StyledGrid item md={12}>
      <NinaBox>
        <HubSuccessWrapper>
          <Typography variant="h1" sx={{ paddingBottom: '16px' }}>
            Your Release has been created.
          </Typography>

          <Box sx={{ paddingTop: '32px' }}>
            <ShareToTwitter />
            <Gates
              inSettings={true}
              releaseGates={releaseGates}
              isAuthority={true}
              releasePubkey={releasePubkey}
              fetchGatesForRelease={fetchGatesForRelease}
            />
            <Button
              fullWidth
              variant="outlined"
              onClick={() => releaseCreateRerouteHandler(inHubs)}
              sx={{ height: '54px', mt: 1, '&:hover': { opacity: '50%' } }}
            >
              <Typography variant="body2" align="left">
                View Release{' '}
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
