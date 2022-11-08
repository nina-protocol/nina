import { useState, useContext, useMemo } from 'react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { Divider } from '@mui/material'

function DashboardWelcome({ userHasSeenUpdateMessage }) {
  const [open, setOpen] = useState(userHasSeenUpdateMessage ? false : true)

  const handleClose = () => {
    localStorage.setItem('nina-dashboard-welcome-message', true)
    setOpen(false)
  }
  return (
    <DashboardModalContainer onClick={() => handleClose()}>
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
              Welcome to your Dashboard
            </Typography>
            <Typography variant="body1" gutterBottom>
              Here you can view your Releases, Collection, Hubs, Followers, and
              accounts you Follow.
            </Typography>

            <Divider sx={{ margin: '15px 0' }} />
            <Typography
              variant="h4"
              gutterBottom
              sx={{ textDecoration: 'underline' }}
            >
              Connections
            </Typography>
            <Typography variant="body1" gutterBottom>
              Clicking any of the Connect buttons at the top of your Dashboard
              will allow you to connect your existing Soundcloud, Twitter, or
              Ethereum accounts to Nina.
            </Typography>
            <Typography variant="body1" gutterBottom>
              Connected accounts will import your username, profile picture, and bio from their respecitve platforms.
            </Typography>

            <Divider sx={{ margin: '15px 0' }} />
            <Typography
              variant="h4"
              gutterBottom
              sx={{ textDecoration: 'underline' }}
            >
              Follow
            </Typography>
            <Typography variant="body1" gutterBottom>
              You can now follow profiles and Hubs to stay up to date on their activity on Nina.
            </Typography>
            <Typography variant="body1" gutterBottom>
              Following will populate the Navigator (the drawer on the right)
              with relevant Release and Hub activity.
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
    </DashboardModalContainer>
  )
}

const DashboardModalContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}))

const StyledModal = styled(Modal)(({ theme }) => ({
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

export default DashboardWelcome
