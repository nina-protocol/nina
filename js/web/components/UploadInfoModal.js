import React, {useState, useEffect, useContext, useMemo} from 'react'
import {styled} from '@mui/material/styles'
import { Paper} from '@mui/material'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import AutorenewIcon from '@mui/icons-material/Autorenew';

import {useSnackbar} from 'notistack'
import Dots from './Dots'

const UploadInfoModal = ({userHasSeenUpdateMessage}) => {
  const [open, setOpen] = useState(userHasSeenUpdateMessage ? false : true)

  const handleClose = () => {
    localStorage.setItem('nina-upload-update-message', true) 
    setOpen(false)
  }

  return (
    <Root>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={() => setOpen(true)}
          sx={{height: '22px', width: '28px', m: 0}}
        >
          <AutorenewIcon sx={{color: 'white'}} />
        </Button>

      <StyledModal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={() => handleClose()}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <StyledPaper>
            <Typography variant='h4' gutterBottom>
              Update:
            </Typography>
            <Typography gutterBottom>
              Our Upload flow has been updated.
            </Typography>
            <Typography gutterBottom>
              We are now using <a href="https://bundlr.network/" target="_blank" style={{textDecoration: 'underline'}}>Bundlr</a> which allows users to easily deposit Sol to their Upload Account. This covers Arweave storage fees.
            </Typography>
            <Typography gutterBottom>
              This update brings us closer to permissionless access and expands file size limitations.
            </Typography>
            <Typography gutterBottom>
              After closing this window, you will see a button that enables the Upload Account interface. You will need to depost ~.10 Sol to create a release.
            </Typography>
            <Typography>
              If you have any questions or need assitance, please reach out to contact@ninaprotocol.com or hop into <a href='https://discord.gg/Uu7U6VKHwj' target="_blank" style={{textDecoration: 'underline'}}>our discord</a>. 
            </Typography>

            <Button
              style={{marginTop: '15px'}}
              color="primary"
              variant="outlined"
              onClick={handleClose}
            >
              <Typography>
               Got it!
              </Typography>
            </Button>

          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}


const Root = styled('div')(({theme}) => ({
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
  display: 'flex',
  flexDirection: 'column'
}))

export default UploadInfoModal
