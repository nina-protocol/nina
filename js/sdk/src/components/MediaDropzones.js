import React, { useState, useEffect } from 'react'
import MediaDropzone from './MediaDropzone.js'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

const MediaDropzones = ({
  values,
  relasePubkey,
  artwork,
  setArtwork,
  track,
  setTrack,
  handleProgress,
  disabled,
  processingProgress,
}) => {
  const [metadata, setMetadata] = useState({})
  useEffect(() => {
    setMetadata({
      artist: values.releaseForm?.artist,
      title: values.releaseForm?.title,
      description: values.releaseForm?.description,
      catalogNumber: values.releaseForm?.catalogNumber,
      duration: track ? track.meta?.duration : 0,
      resalePercentage: values.releaseForm.resalePercentage * 100,
    })
  }, [values, track])

  return (
    <StyledDropZones>
      <label htmlFor="track"></label>
      <MediaDropzone
        type="track"
        releasePubkey={relasePubkey}
        track={track}
        setTrack={setTrack}
        handleProgress={handleProgress}
        disabled={disabled}
        processingProgress={processingProgress}
      />
      <label htmlFor="artwork"></label>
      <MediaDropzone
        type="artwork"
        artwork={artwork}
        setArtwork={setArtwork}
        releasePubkey={relasePubkey}
        metadata={metadata}
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
