import React, { useState, useEffect, useMemo } from 'react'
import MediaDropzone from './MediaDropzone.js'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import {Typography} from '@mui/material'
import dynamic from 'next/dynamic'
const ImageCropperModal = dynamic(() => import('./ImageCropperModal'))

const MediaDropzones = ({
  values,
  releasePubkey,
  artwork,
  setArtwork,
  track,
  setTrack,
  handleProgress,
  disabled,
  processingProgress,
}) => {
  const [metadata, setMetadata] = useState({})
  const [uncroppedImage, setUncroppedImage] = useState(undefined)
  const [croppedImage, setCroppedImage] = useState(undefined)

  const renderImageDropZones = useMemo(() => {
    if (!uncroppedImage && !croppedImage) {
      return (  
        <>
          <Typography>this one</Typography>
          <MediaDropzone
            type="cropper"
            artwork={artwork}
            setArtwork={setArtwork}
            setUncroppedImage={setUncroppedImage}
            releasePubkey={releasePubkey}
            metadata={metadata}
            handleProgress={handleProgress}
            disabled={disabled}
          />
        </>
        )
    } 
    if (uncroppedImage && !croppedImage) {
      return (
        <>
          <Typography variant="h6">this one </Typography>
          <ImageCropperModal
            cropperModalOpen={uncroppedImage && !croppedImage}
            uncroppedImage={uncroppedImage}
            setArtwork={setArtwork}
            setCroppedImage={setCroppedImage}
            setUncroppedImage={setUncroppedImage}
          />
        </>
      )
    }
    if (croppedImage) {
      return (
        <>
          <Typography variant="h6">thatone </Typography>
          <MediaDropzone
            type="artwork"
            artwork={artwork}
            setArtwork={setArtwork}
            setUncroppedImage={setUncroppedImage}
            setCroppedImage={setCroppedImage}
            releasePubkey={releasePubkey}
            metadata={metadata}
            handleProgress={handleProgress}
            disabled={disabled}
            croppedImage={croppedImage}
          />
        </>
      )
    }
  }, [uncroppedImage, croppedImage])


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
        releasePubkey={releasePubkey}
        track={track}
        setTrack={setTrack}
        handleProgress={handleProgress}
        disabled={disabled}
        processingProgress={processingProgress}
      />
      <label htmlFor="artwork"></label>
      {renderImageDropZones}
      {/* {!uncroppedImage && !croppedImage && (
        <>
        <Typography>this one</Typography>
        <MediaDropzone
          type="cropper"
          artwork={artwork}
          setArtwork={setArtwork}
          setUncroppedImage={setUncroppedImage}
          releasePubkey={releasePubkey}
          metadata={metadata}
          handleProgress={handleProgress}
          disabled={disabled}
        />
        </>
      )}

      {croppedImage && (
        <>
        <Typography variant="h6">thatone </Typography>
         <MediaDropzone
          type="artwork"
          artwork={artwork}
          setArtwork={setArtwork}
          setUncroppedImage={setUncroppedImage}
          releasePubkey={releasePubkey}
          metadata={metadata}
          handleProgress={handleProgress}
          disabled={disabled}
          croppedImage={croppedImage}
        /> 
        </>

      )}

      {uncroppedImage && !croppedImage && (
        <ImageCropperModal
          cropperModalOpen={uncroppedImage && !croppedImage} 
          uncroppedImage={uncroppedImage}
          // artwork={artwork} 
          setArtwork={setArtwork} 
          setCroppedImage={setCroppedImage}
          setUncroppedImage={setUncroppedImage}
          />
      )} */}
    </StyledDropZones>
  )
}
const StyledDropZones = styled(Box)(() => ({
  height: '100%',
}))

export default MediaDropzones
