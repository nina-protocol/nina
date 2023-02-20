import React, { useState, useMemo } from 'react'
import MediaDropzone from './MediaDropzone.js'
import { Typography } from '@mui/material'
import dynamic from 'next/dynamic'
const ImageCropperModal = dynamic(() => import('./ImageCropperModal'))

const ImageMediaDropzone = ({
  artwork,
  setArtwork,
  handleProgress,
  disabled,
  inHubCreate,
  update,
  currentImageUrl,
}) => {
  const [uncroppedImage, setUncroppedImage] = useState(undefined)
  const [croppedImage, setCroppedImage] = useState(undefined)

  const type = useMemo(() => {
    return !uncroppedImage && !croppedImage ? 'cropper' : 'artwork'
  }, [uncroppedImage, croppedImage])

  const renderImageDropZones = useMemo(() => {
    if (uncroppedImage && !croppedImage) {
      return (
        <>
          <Typography variant="h6">this one</Typography>
          <ImageCropperModal
            cropperModalOpen={uncroppedImage && !croppedImage}
            uncroppedImage={uncroppedImage}
            setArtwork={setArtwork}
            setCroppedImage={setCroppedImage}
            setUncroppedImage={setUncroppedImage}
          />
        </>
      )
    } else {
      return (
        <>
          <MediaDropzone
            type={type}
            artwork={artwork}
            setArtwork={setArtwork}
            setUncroppedImage={setUncroppedImage}
            setCroppedImage={setCroppedImage}
            handleProgress={handleProgress}
            disabled={disabled}
            croppedImage={croppedImage}
            inHubCreate={inHubCreate}
            update={update}
            currentImageUrl={currentImageUrl}
          />
        </>
      )
    }
  }, [uncroppedImage, croppedImage])

  return (
    <>
      <label htmlFor="artwork"></label>
      {renderImageDropZones}
    </>
  )
}
export default ImageMediaDropzone
