import React, {useState, useCallback, useEffect} from 'react'
// import ReactDOM from 'react-dom'
import Cropper from 'react-easy-crop'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
// import ImgDialog from './ImgDialog'
import getCroppedImg from '../utils/cropImage'
import {styled} from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'


// import {styles} from './styles'

const ImageCropperModal = ({artwork, setArtwork, cropperModalOpen}) => {
  const [open, setOpen] = useState(false)
  const [crop, setCrop] = useState({x: 0, y: 0})
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [croppedImage, setCroppedImage] = useState(null)
  const [originalImage, setOriginalImage] = useState(null)

    useEffect(() => {
      setOpen(cropperModalOpen)
    }, [cropperModalOpen])

    useEffect(() => {
      if (artwork) {
        setOriginalImage(artwork.meta.previewUrl)
      }
    }, [artwork])
    

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(
        originalImage,
        croppedAreaPixels,
        rotation
      )
      console.log('donee', {croppedImage})
      setCroppedImage(croppedImage)
    } catch (e) {
      console.error(e)
    }
  }, [croppedAreaPixels, rotation])

  const onClose = useCallback(() => {
    setCroppedImage(null)
  }, [])

console.log('croppedImage :>> ', croppedImage);

  return (
    <Root >
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={() => setOpen(true)}
        >
          <Typography align={'right'} textTransform={'none'}>
            Edit Image
          </Typography>
        </Button>


      <StyledModal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <StyledPaper>
            <div>
              <CropContainer>
                <Cropper
                  image={originalImage}
                  crop={crop}
                  rotation={rotation}
                  zoom={zoom}
                  aspect={4 / 3}
                  onCropChange={setCrop}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </CropContainer>
              <Controls>
                <SliderContainer>
                  <Typography
                    variant="overline"
                  >
                    Zoom
                  </Typography>
                  <StyledSlider
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e, zoom) => setZoom(zoom)}
                  />
                </SliderContainer>
                <SliderContainer >
                  <Typography
                    variant="overline"
                  >
                    Rotation
                  </Typography>
                  <StyledSlider
                    value={rotation}
                    min={0}
                    max={360}
                    step={1}
                    aria-labelledby="Rotation"
                    onChange={(e, rotation) => setRotation(rotation)}
                  />
                </SliderContainer>
                <Button
                  onClick={showCroppedImage}
                  variant="contained"
                  color="primary"
                >
                  Show Result
                </Button>
              </Controls>
              {/* <ImgDialog img={croppedImage} onClose={onClose} /> */}
            </div>
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const Root = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}))

const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))


const StyledPaper = styled(Paper)(({theme}) => ({
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  padding: '16px 32px 16px 32px',
  width: '40vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  zIndex: '10',
}))

const CropContainer = styled('div')(() => ({
  position: 'relative',
  width: '100%',
  height: 200,
  background: '#333',
}))

const Controls = styled('div')(({theme}) => ({
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}))

const SliderContainer = styled('div')(() => ({
  display: 'flex',
  flex: '1',
  alignItems: 'center',
}))

const StyledSlider = styled(Slider)(({theme}) => ({
  padding: '22px 0px',
  marginLeft: 32,
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: '0 16px',
  },
}))

export default ImageCropperModal
