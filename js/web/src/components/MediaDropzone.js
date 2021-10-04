import React from 'react'
import ninaCommon from 'nina-common'
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader'
import { makeStyles } from '@material-ui/core/styles'

const { NinaClient } = ninaCommon.utils

function MediaDropzone({
  type,
  releasePubkey,
  metadata,
  setArtwork,
  setTrack,
}) {
  const classes = useStyles()

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
      body.append('sellerFeeBasisPoints', metadata.royaltyAmount)
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
        dropzone: { minHeight: 60, maxHeight: 60, margin: '0.5rem 0' },
      }}
    />
  )
}

const useStyles = makeStyles((theme) => ({
  dropZone: {
    border: `1px solid ${theme.vars.purple}`,
    borderRadius: `${theme.vars.borderRadius}`,
    display: 'flex',
    width: '100%',
    marginBottom: '1rem',
    cursor: 'pointer',
  },
  dropZoneInputLabel: {
    margin: 'auto',
    fontSize: '1rem',
    color: `${theme.vars.purple}`,
  },
  dropZonePreviewWrapper: {
    width: '90%',
    margin: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}))

export default MediaDropzone
