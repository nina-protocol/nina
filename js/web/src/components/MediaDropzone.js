import React from 'react'
import ninaCommon from 'nina-common'
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader'

const PREFIX = 'MediaDropzone'

const classes = {
  dropZone: `${PREFIX}-dropZone`,
  dropZoneInputLabel: `${PREFIX}-dropZoneInputLabel`,
  dropZonePreviewWrapper: `${PREFIX}-dropZonePreviewWrapper`,
}

const { NinaClient } = ninaCommon.utils
const MediaDropzone = ({
  type,
  releasePubkey,
  metadata,
  setArtwork,
  setTrack,
}) => {
  const getUploadParams = ({ file }) => {
    const body = new FormData()
    body.append('file', file)
    body.append('type', type)
    body.append('tokenId', releasePubkey)
    if (metadata) {
      body.append('artist', metadata.artist)
      body.append('title', metadata.title)
      body.append('description', metadata.description)
      body.append('duration', metadata.duration)
      body.append('catalogNumber', metadata.catalogNumber)
      body.append('sellerFeeBasisPoints', metadata.resalePercentage)
    }
    return {
      url: `${NinaClient.endpoints.pressingPlant}/api/file`,
      body,
    }
  }

  const handleChangeStatus = ({ file, meta, restart }, status) => {
    if (type === 'artwork') {
      if (status === 'removed') {
        setArtwork(undefined)
      } else {
        setArtwork({
          file,
          meta,
          restart,
        })
      }
    } else if (type === 'track') {
      if (status === 'removed') {
        setTrack(undefined)
      } else {
        setTrack({
          file,
          meta,
          restart,
        })
      }
    }
  }

  return (
    <Dropzone
      getUploadParams={getUploadParams}
      onChangeStatus={handleChangeStatus}
      accept={type === 'track' ? 'audio/*' : 'image/*'}
      maxFiles={1}
      SubmitButtonComponent={null}
      autoUpload={false}
      canRestart={false}
      classNames={{
        dropzone: classes.dropZone,
        inputLabel: classes.dropZoneInputLabel,
        preview: classes.dropZonePreviewWrapper,
      }}
      inputContent={
        type === 'track'
          ? 'Drag or browse to add track'
          : 'Drag or browse to add artwork'
      }
      styles={{
        dropzone: { 
          minHeight: 60, 
          maxHeight: 60, 
          margin: '0.5rem 0', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          marginBottom: '1rem',
          cursor: 'pointer',
        },
        preview: { 
          width: '90%',
          margin: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        inputLabel: {
          cursor: 'pointer'
        }
      }}
    />
  )
}

export default MediaDropzone
