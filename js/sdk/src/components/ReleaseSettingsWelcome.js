import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { Divider } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'

const RELEASE_SETTINGS_WELCOME_PHASE_KEY = 'release-settings-welcome-phase-3'

function ReleaseSettingsWelcome() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const userHasSeenUpdateMessage = localStorage.getItem(
      RELEASE_SETTINGS_WELCOME_PHASE_KEY
    )
    if (!userHasSeenUpdateMessage) {
      setOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(RELEASE_SETTINGS_WELCOME_PHASE_KEY, true)
    setOpen(false)
  }

  return (
    <ModalContainer onClick={() => handleClose()}>
      <StyledModal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={() => handleClose()}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={open}>
          <StyledPaper>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ textDecoration: 'underline' }}
            >
              {`We've made some changes to how you manage your releases`}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <span>
                Click the <SettingsIcon sx={{ color: 'inherit' }} /> to access
                Revenue Share Info.
              </span>
            </Typography>
            <Typography variant="body1" gutterBottom>
              {`We'll be adding some more Release Settings here soon.`}
            </Typography>
            <Divider sx={{ margin: '15px 0' }} />
            <Typography
              variant="h4"
              gutterBottom
              sx={{ textDecoration: 'underline' }}
            >
              Gates
            </Typography>
            <Typography variant="body1" gutterBottom>
              {`Gates allow you to upload files (lossless audio, stems, outtakes, PDFs, etc) that are exclusively available to collectors of your release.`}
            </Typography>
            <Divider sx={{ margin: '15px 0' }} />
            <Typography
              variant="h4"
              gutterBottom
              sx={{ textDecoration: 'underline' }}
            >
              Close Edition
            </Typography>
            <Typography variant="body1" gutterBottom>
              {`You can now close your Releases.  When you close your Release it will become Sold Out with an edition size equal to the total amount purchased.`}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => handleClose()}
              sx={{ fontSize: '14px', mt: 1 }}
            >
              OK
            </Button>
          </StyledPaper>
        </Fade>
      </StyledModal>
    </ModalContainer>
  )
}

const ModalContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}))

const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  width: '40vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  zIndex: '10',
  display: 'flex',
  flexDirection: 'column',
}))

export default ReleaseSettingsWelcome
