import React, { useContext, useMemo } from 'react'
import { styled } from '@mui/material/styles'

import Box from '@mui/material/Box'

import { Typography } from '@mui/material'
import Button from '@mui/material/Button'

import ShareToTwitter from './ShareToTwitter'
import Release from '../contexts/Release'
import GateCreateModal from './GateCreateModal'
import Link from 'next/link'
const ReleaseCreateSuccess = (props) => {
  const {
    hubHandle,
    inHubs,
    releasePubkey,
    hubReleaseKey,
    artist,
    title,
    url,
    image,
    handleReload,
  } = props
  const { fetchGatesForRelease, gatesState } = useContext(Release.Context)
  const releaseGates = useMemo(
    () => gatesState[releasePubkey],
    [gatesState, releasePubkey]
  )

  return (
    <>
      <ReleaseSuccessContainer>
        <Typography
          variant="h4"
          align="left"
          marginLeft={'auto'}
          marginRight={'auto'}
          marginBottom={'16px'}
          width={'680px'}
        >
          {`${artist} -`} <i>{`${title}`}</i> {`has been created.`}
        </Typography>
        <ReleaseSuccessBox columns={'repeat(2, 1fr)'}>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', margin: 'auto' }}
          >
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                sx={{ height: '54px', '&:hover': { opacity: '50%' } }}
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
                onClick={() => handleReload()}
              >
                <a>
                  <Typography variant="body2" align="left">
                    Create Another Release
                  </Typography>
                </a>
              </Button>
              <ShareToTwitter artist={artist} title={title} url={url} />
            </Box>
          </Box>
        </ReleaseSuccessBox>
      </ReleaseSuccessContainer>
    </>
  )
}
const ReleaseSuccessContainer = styled(Box)(() => ({
  height: '100%',
}))

const ReleaseSuccessBox = styled(Box)(() => ({
  display: 'grid',
  width: '765px',
  // minHeight: '547px',
  margin: 'auto',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gridColumnGap: '0px',
  gridAutoRows: 'auto',
}))

export default ReleaseCreateSuccess
