import React, {useState, useEffect, useContext} from 'react'
import {styled} from '@mui/material/styles'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider';
import Slide from '@mui/material/Slide';
import IdentityVerification from './IdentityVerification'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'


const WelcomeModal = ({profilePubkey, showWelcomeModal}) => {
  const {verificationState} = useContext(Nina.Context)

  // const [open, setOpen] = useState(showWelcomeModal)
  const [open, setOpen] = useState(true)
  const [profileVerifications, setProfileVerifications] = useState([])


 useEffect(() => {
  localStorage.setItem('nina_welcomeModal_seen', 'true')
 }, [])


  useEffect(() => {
    if (verificationState[profilePubkey]) {
      setProfileVerifications(verificationState[profilePubkey])
    }
  }, [verificationState])

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Root>
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
        <Slide direction='up' in={open} mountOnEnter unmountOnExit>
          <StyledPaper>
            <Box
              display="flex"
              flexDirection={'column'}
              justifyContent={'space-between'}
              mb={3}
              width="100%"
            >

              <Typography variant={'h2'} gutterBottom>
                Welcome to Nina
              </Typography>

              <Typography gutterBottom>
                Now you can:
              </Typography>

              <StyledWelcomeSection>
                <Typography gutterBottom>
                  - Listen:
                </Typography>
                <Typography gutterBottom>
                  It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum
                </Typography>
              </StyledWelcomeSection>


              <StyledWelcomeSection>
                <Typography gutterBottom>
                  - Verify (connect):
                </Typography>
                <Typography gutterBottom>
                  It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum
                </Typography>

                <IdentityVerification
                  profilePubkey={profilePubkey}
                  verifications={profileVerifications}
                />
              </StyledWelcomeSection>

              
              <StyledWelcomeSection>
                <Typography gutterBottom>
                  - Verify:
                </Typography>
                <Typography gutterBottom>
                  It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum
                </Typography>
              </StyledWelcomeSection>
   
              <Divider />

            </Box>

    

            <Button
              variant="outlined"
              color="primary"
              type="submit"
              onClick={handleCancel}
              sx={{
                marginTop: '15px',
              }}
              fullWidth
            >
              <Typography align="center" textTransform={'none'}>
                okay
              </Typography>
            </Button>
          </StyledPaper>
        </Slide>
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
  marginTop: '24px'
}))

const StyledPaper = styled(Paper)(({theme}) => ({
  backgroundColor: theme.palette.background.paper,
  border: '1px solid #000',
  padding: theme.spacing(2, 2, 2),
  width: '40vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  zIndex: '10',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
}))

const StyledWelcomeSection = styled(Box)(() => ({
  margin: '15px 0'
}))


export default WelcomeModal
