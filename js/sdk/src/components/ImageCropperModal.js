import React, {useState, useEffect, useContext, useMemo} from 'react'
import {styled} from '@mui/material/styles'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Nina from '../contexts/Nina'
import {useSnackbar} from 'notistack'
import Dots from './Dots'

const ImageCropperModal = ({artwork, setArtwork, cropperModalOpen}) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(cropperModalOpen)
  }, [cropperModalOpen])
  

  console.log('artwork!!!! :>> ', artwork);

  const {enqueueSnackbar} = useSnackbar()
  return (
    <Root >
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={() => setOpen(true)}
        >
          <Typography align={'right'} textTransform={'none'}>
            Manage Upload Account
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
            <Typography>
              I AM THE IMAGE MODAL
            </Typography>
            <Typography>
              {artwork?.meta?.previewUrl}
            </Typography>

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
  width: '40vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  zIndex: '10',
}))

export default ImageCropperModal
