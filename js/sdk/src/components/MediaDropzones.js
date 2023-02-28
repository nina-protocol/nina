import React from 'react'
import MediaDropzone from './MediaDropzone.js'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import ImageMediaDropzone from './ImageMediaDropzone.js'

const MediaDropzones = ({
  releasePubkey,
  artwork,
  setArtwork,
  track,
  setTrack,
  handleProgress,
  disabled,
  processingProgress,
  availableBalance,
}) => {
  return (
    <StyledDropZones>
      <label htmlFor="track"></label>
      <MediaDropzone
        type="track"
        releasePubkey={releasePubkey}
        track={track}
        setTrack={setTrack}
        handleProgress={handleProgress}
        disabled={disabled}
        processingProgress={processingProgress}
        availableBalance={availableBalance}
      />
      <ImageMediaDropzone
        artwork={artwork}
        setArtwork={setArtwork}
        handleProgress={handleProgress}
        disabled={disabled}
      />
    </StyledDropZones>
  )
}
const StyledDropZones = styled(Box)(() => ({
  height: '100%',
}))

export default MediaDropzones
