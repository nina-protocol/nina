import React, {useState, useEffect, useMemo} from 'react'
import MediaDropzone from './MediaDropzone.js'
import {styled} from '@mui/material/styles'
import Box from '@mui/material/Box'
import {Typography} from '@mui/material'
import dynamic from 'next/dynamic'
const ImageCropperModal = dynamic(() => import('./ImageCropperModal'))


const ImageMediaDropzone = ({
  releasePubkey,
  artwork,
  setArtwork,
  handleProgress,
  disabled,
  inHubCreate,
  update,
  currentImageUrl
}) => {
  const [metadata, setMetadata] = useState({})
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
            releasePubkey={releasePubkey}
            metadata={metadata}
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
const StyledDropZones = styled(Box)(() => ({
  height: '100%',
}))

export default ImageMediaDropzone
