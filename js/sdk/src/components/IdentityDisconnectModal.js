import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Dots from './Dots'

const IdentityVerificationModal = ({ action, type, value, open, setOpen }) => {
  const [inProgress, setInProgress] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const titleForType = (type) => {
    return `Disconnect ${
      type.charAt(0).toUpperCase() + type.slice(1)
    } Verification for: ${value}`
  }

  const handleAction = async () => {
    setInProgress(true)
    await action()
    handleClose()
    setInProgress(false)
  }

  return (
    <Root>
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
            <Typography
              align="center"
              variant="h4"
              id="transition-modal-title"
              gutterBottom
            >
              {titleForType(type)}
            </Typography>
            <Typography align="center" id="transition-modal-title" gutterBottom>
              I'M THE DISCONNECT MODAL  
            </Typography>
            <Button
              style={{ marginTop: '15px' }}
              color="primary"
              variant="outlined"
              disabled={inProgress}
              onClick={handleAction}
            >
              <Typography>
                {!inProgress && 'Disconnect'}
                {inProgress && (
                  <Dots
                    msg={'Verification Transaction Pending... Please wait'}
                  />
                )}
              </Typography>
            </Button>
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
  [theme.breakpoints.down('md')]: {
    width: 'unset',
    margin: '15px',
    padding: theme.spacing(2),
  },
}))

export default IdentityVerificationModal
