import React, { useContext } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import SmoothImage from 'react-smooth-image'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { Typography } from '@mui/material'
import ninaRecord from '../assets/nina-record.png'
import { Fade } from '@mui/material'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'

const { AudioPlayerContext } = ninaCommon.contexts

const ReleaseCard = (props) => {
  const { artwork, metadata, preview, releasePubkey, track } = props
  const { updateTxid } = useContext(AudioPlayerContext)
  return (
    <StyledReleaseCard>
      <StyledReleaseInfo>
        {track && (
          <Fade in={true}>
            <Button
              onClick={() => {
                console.log('click play!');
                console.log(track.properties.files[0].uri);
                updateTxid(track.properties.files[0].uri, releasePubkey, true)
              }}
              sx={{ height: '22px', width: '28px' }}
            >
              <PlayCircleOutlineOutlinedIcon sx={{ color: 'white' }} />
            </Button>
          </Fade>
        )}

        {metadata && (
          <Fade in={true}>
            <Typography variant="h4" color="white" align="left">
              {metadata?.properties?.artist || metadata?.artist},{' '}
              <i>{metadata?.properties?.title || metadata?.title}</i>
            </Typography>
          </Fade>
        )}
      </StyledReleaseInfo>

      <Box>
        {preview ? (
          <SmoothImage
            src={
              artwork?.meta.status === undefined
                ? ninaRecord
                : artwork.meta.previewUrl
            }
            alt={metadata.artist}
          />
        ) : (
          <>
            {metadata && (
              <SmoothImage src={metadata.image} alt={metadata.name} />
            )}
          </>
        )}
      </Box>
    </StyledReleaseCard>
  )
}

const StyledReleaseCard = styled(Box)(() => ({
  width: '100%',
  margin: 'auto',
}))

const StyledReleaseInfo = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.blue,
  color: theme.palette.white,
  height: theme.spacing(5.6),
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
}))

export default ReleaseCard
