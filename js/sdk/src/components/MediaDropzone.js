import React, { useContext, useMemo } from 'react'
import Dropzone from 'react-dropzone-uploader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined'
import Image from 'next/image'
import Nina from '../contexts/Nina'
import { styled } from '@mui/material/styles'

const MediaDropzone = ({
  type,
  artwork,
  setArtwork,
  setTrack,
  disabled,
  processingProgress,
  setUncroppedImage,
  setCroppedImage,
  uncroppedImage,
  croppedImage,
  inHubCreate,
  update,
  currentImageUrl,
  closedBundlrModal,
}) => {
  const { MAX_AUDIO_FILE_UPLOAD_SIZE, MAX_IMAGE_FILE_UPLOAD_SIZE } = useContext(
    Nina.Context
  )
  const styles = inHubCreate
    ? {
        dropzone: {
          minHeight: 60,
          display: 'flex',
          justifyContent: 'center',
          minWidth: '100px',
          width: 'auto',
          height: '100px',
          cursor: 'pointer',
          marginBottom: '15px',
          boxShadow: 'inset 0px 0px 30px 0px #0000001A',
          backgroundColor: '#EAEAEA',
          backgroundImage: update ? `url("${currentImageUrl}")` : '',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
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
          textAlign: 'left',
          padding: '15px',
          margin: 'auto',
        },
      }
    : {
        dropzone: {
          minHeight: 60,
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          height: type === 'track' ? '113px' : '350px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          marginBottom: type === 'track' ? '15px' : '',
          boxShadow: 'inset 0px 0px 30px 0px #0000001A',
          backgroundColor: '#EAEAEA',
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
          cursor: disabled ? 'not-allowed' : 'pointer',
          width: '100%',
          textAlign: 'left',
          padding: '15px',
        },
      }

  const handleChangeStatus = useMemo(() => {
    return ({ meta, file, remove }, status) => {
      if (status === 'rejected_file_type') {
        return
      }
      if (meta.status === 'error_validation') {
        const size = meta.size / 1000000
        if (file.type.includes('audio')) {
          if (file.type !== 'audio/mpeg') {
            alert(`Your track is not an MP3. \nPlease upload an MP3.`)
            setTrack(undefined)
            return
          } else if (size > MAX_AUDIO_FILE_UPLOAD_SIZE) {
            alert(
              `Your track is ${size} mb... \nPlease upload a file smaller than ${MAX_AUDIO_FILE_UPLOAD_SIZE} mbs`
            )
            return
          }
        } else if (type === 'artwork') {
          alert(
            `your image is ${size} mb... \nPlease upload an image smaller than ${MAX_IMAGE_FILE_UPLOAD_SIZE} mbs`
          )
          return
        }
      }

      if (type === 'artwork') {
        if (status === 'removed') {
          setArtwork(undefined)
          setUncroppedImage(undefined)
          setCroppedImage(undefined)
        } else if (status === 'done') {
          try {
            setArtwork({
              file,
              meta,
            })
          } catch (error) {
            console.warn('error :>> ', error)
          }
        }
      } else if (type === 'cropper') {
        if (status === 'removed') {
          setUncroppedImage(undefined)
        } else {
          setUncroppedImage({
            file,
            meta,
            remove,
          })
        }
      } else if (type === 'track') {
        if (status === 'removed') {
          setTrack(undefined)
        } else {
          setTrack({
            file,
            meta,
            remove,
          })
        }
      }
    }
  }, [artwork, uncroppedImage, croppedImage])

  const inputLayout = (type) => {
    if (type === 'track') {
      return (
        <>
          <AddOutlinedIcon />
          <Typography variant="h2">Upload Track</Typography>
          <Typography variant="subtitle1">File Format: MP3</Typography>
        </>
      )
    } else {
      return (
        <>
          <AddOutlinedIcon />
          {!inHubCreate && (
            <>
              <Typography variant="h2">Upload Artwork</Typography>
              <Typography variant="subtitle1">
                File Formats: JPG, PNG
              </Typography>
            </>
          )}
        </>
      )
    }
  }

  const validateImage = (fileWithMeta) => {
    const size = fileWithMeta.file.size / 1000000
    if (fileWithMeta.file.type !== 'image/png') {
      return true
    }

    if (size > MAX_IMAGE_FILE_UPLOAD_SIZE) {
      return true
    }
    return false
  }

  const validateTrack = (fileWithMeta) => {
    const size = fileWithMeta.file.size / 1000000
    if (size > MAX_AUDIO_FILE_UPLOAD_SIZE) {
      return true
    }
    if (fileWithMeta.file.type !== 'audio/mpeg') {
      return true
    }
    return false
  }

  const Preview = ({ meta, fileWithMeta }) => {
    if (meta.type.includes('image') && meta.previewUrl) {
      return (
        <Box style={previewBoxStyles}>
          {cancelIcon(fileWithMeta.remove)}
          <Image src={meta.previewUrl} layout="fill" alt="preview" />
        </Box>
      )
    } else if (meta.type.includes('audio')) {
      var minutes = Math.floor(meta.duration / 60)
      var seconds = Math.ceil(meta.duration - minutes * 60)

      return (
        <Box style={{ ...previewBoxStyles, ...audioPreviewStyles }}>
          {cancelIcon(fileWithMeta.remove)}
          <Box sx={{ padding: '35px 15px' }}>
            <Typography
              align="left"
              variant="h5"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              maxWidth="100%"
              overflow="hidden"
            >
              {meta.name}
            </Typography>
            <Typography align="left" variant="subtitle1">
              {minutes}:{seconds}
            </Typography>
            <Typography align="left" variant="subtitle1">
              {processingProgress === 1 ? 'Processed' : 'Processing'}:{' '}
              {(processingProgress * 100).toFixed(2)}%
            </Typography>
          </Box>
        </Box>
      )
    } else {
      return null
    }
  }

  const previewBoxStyles = {
    position: 'relative',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    color: 'white',
  }

  const audioPreviewStyles = {
    backgroundColor: '#2D81FF',
    '& h5': {
      border: '2px solid red !important',
      color: 'red !important',
    },
  }

  const cancelIcon = (remove) => (
    <ClearOutlinedIcon
      onClick={remove}
      style={{
        position: 'absolute',
        top: '15px',
        left: '10px',
        color: 'white',
        zIndex: '100',
      }}
    />
  )
  return (
    <>
      <Dropzone
        onChangeStatus={handleChangeStatus}
        accept={type === 'track' ? 'audio/mpeg' : 'image/jpeg,image/png'}
        maxFiles={1}
        validate={
          type === 'track'
            ? (fileWithMeta) => validateTrack(fileWithMeta, closedBundlrModal)
            : (fileWithMeta) => validateImage(fileWithMeta)
        }
        SubmitButtonComponent={null}
        autoUpload={false}
        canRestart={false}
        classNames={{
          dropzone: classes.dropZone,
          inputLabel: classes.dropZoneInputLabel,
          preview: classes.dropZonePreviewWrapper,
          previewStatusContainer: classes.dropZonePreviewStatusContainer,
        }}
        disabled={disabled}
        inputContent={inputLayout(type)}
        PreviewComponent={Preview}
        initialFiles={croppedImage ? [croppedImage] : []}
        styles={styles}
        multiple={false}
      />

      {inHubCreate && (
        <Copy>
          <Typography variant="body1">Upload Hub Logo Image</Typography>
          <Typography variant="subtitle1">File Formats: JPG, PNG</Typography>

          {update && (
            <Typography variant="subtitle1">
              Click current image to replace hub image
            </Typography>
          )}
        </Copy>
      )}
    </>
  )
}

const PREFIX = 'MediaDropzone'

const classes = {
  dropZone: `${PREFIX}-dropZone`,
  dropZoneInputLabel: `${PREFIX}-dropZoneInputLabel`,
  dropZonePreviewWrapper: `${PREFIX}-dropZonePreviewWrapper`,
  dropZonePreviewStatusContainer: `${PREFIX}-dropZonePreviewStatusContainer`,
}

const Copy = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
  paddingLeft: '15px',
  '& p': {
    color: 'rgba(0,0,0, 0.6) !important',
    fontSize: '14px !important',
    textTransform: 'uppercase',
  },
}))

export default MediaDropzone
