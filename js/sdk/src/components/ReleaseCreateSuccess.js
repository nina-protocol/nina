import React, { useContext, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { Typography } from '@mui/material'
import Button from '@mui/material/Button'
import ShareToTwitter from './ShareToTwitter'
import Release from '../contexts/Release'
import GateCreateModal from './GateCreateModal'
import Link from 'next/link'
import Image from 'next/image'
const ReleaseCreateSuccess = (props) => {
  const {
    hubHandle,
    inHubs,
    releasePubkey,
    hubReleasePubkey,
    artist,
    title,
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
        <DescriptionOverflowContainer
          sx={{ display: 'flex', flexDirection: 'row' }}
        >
          <ReleaseTypography variant="h4" align="left">
            {`${artist} -`} <i>{`${title}`}</i>
          </ReleaseTypography>
          <Typography
            variant="h4"
            sx={{
              maxWidth: '100%',
              overflow: 'visible',
              margin: '0 6px',
              whiteSpace: 'nowrap',
            }}
          >{`has been created.`}</Typography>
        </DescriptionOverflowContainer>
        <ReleaseSuccessBox>
          <ImageBox>
            <Image
              src={`https://arweave.net/${image}`}
              alt={artist}
              width={'300px'}
              height={'300px'}
              priority={true}
              loader={({ src }) => {
                return src
              }}
            />
          </ImageBox>

          <CtaBox>
            <Button fullWidth variant="outlined" sx={{ height: '54px' }}>
              <Link
                href={
                  inHubs
                    ? `/${hubHandle}/releases/${hubReleasePubkey}`
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
            <ShareToTwitter
              artist={artist}
              title={title}
              releasePubkey={releasePubkey}
            />
          </CtaBox>
        </ReleaseSuccessBox>
      </ReleaseSuccessContainer>
    </>
  )
}
const ReleaseSuccessContainer = styled(Box)(() => ({
  height: '100%',
  margin: 'auto',
}))

const ReleaseSuccessBox = styled(Box)(() => ({
  display: 'grid',
  width: '765px',
  margin: 'auto',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gridColumnGap: '0px',
  gridAutoRows: 'auto',
  columns: 'repeat(2, 1fr)',
}))

const ImageBox = styled(Box)(() => ({
  margin: 'auto',
  width: '300px',
}))

const CtaBox = styled(Box)(() => ({
  margin: 'auto',
  width: 'calc(100% - 50px)',
  paddingLeft: '50px',
  display: 'flex',
  flexDirection: 'column',
}))

const ReleaseTypography = styled(Typography)(() => ({
  margin: 0,
  maxWidth: '600px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}))

const DescriptionOverflowContainer = styled(Box)(() => ({
  marginLeft: 'auto',
  marginRight: 'auto',
  maxWidth: '600px',
  display: 'flex',
  ['-webkit-flex-direction']: 'row',
  alignItems: 'center',
  marginBottom: '16px',
}))

export default ReleaseCreateSuccess
