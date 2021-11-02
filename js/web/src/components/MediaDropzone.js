import React from 'react'
import ninaCommon from 'nina-common'
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader'
import { Typography } from '@mui/material'
import { Icon } from '@material-ui/core'
import plus from '../assets/plus.svg'

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

  const inputLayout = (type) => {
    //NOTE: we should reject non-square files for artwork
    const plusIcon = (
      <Icon>
        <img src={plus} height={15} width={15} />
      </Icon>
    )
    if (type === 'track') {
      return (
        <>
          {plusIcon}
          <Typography variant="h5">Upload Track</Typography>
          <Typography>File Formats: MP3</Typography>
        </>
      )
    } else {
      return (
        <>
          {plusIcon}
          <Typography variant="h5">Upload Artwork</Typography>
          <Typography>File Formats: JPG, PNG</Typography>
        </>
      )
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
      inputContent={inputLayout(type)}
      styles={{
        dropzone: {
          minHeight: 60,
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          height: type === 'track' ? '' : '350px',
          cursor: 'pointer',
          marginBottom: type === 'track' ? '15px' : '',
          boxShadow: 'inset 0px 0px 30px 0px #0000001A',
          backgroundColor: '#EAEAEA'
        },
        preview: {
          margin: 'auto',
          alignItems: 'center',
        },
        previewImage: {
          width: '100%',
          maxHeight: '100%',
          maxWidth: 'unset',
        },
        inputLabel: {
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          padding: '15px'
        },
      }}
    />
  )
}



export default MediaDropzone
