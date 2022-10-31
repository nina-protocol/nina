import { useEffect, useContext, useState, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import { useWallet } from '@solana/wallet-adapter-react'
import Typography from '@mui/material/Typography'

const EmailCaptureModal = () => {
  const wallet = useWallet()

  const [open, setOpen] = useState(true)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [twitterHandle, setTwitterHandle] = useState('')
  const [soundcloudHandle, setSoundcloudHandle] = useState('')
  return (
    <Root displaySmall={false}>
      <StyledModal
       aria-labelledby="transition-modal-title"
       aria-describedby="transition-modal-description"
       open={open}
       onClose={() => setOpen(false)}
       closeAfterTransition
       BackdropComponent={Backdrop}
       BackdropProps={{
         timeout: 500,
       }}>
        <Fade in={open}>
          <StyledPaper>
            <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center',}}>

            
            <Typography
               align="center"
               variant="h4"
               id="transition-modal-title"
               gutterBottom
               sx={{ fontWeight: 'bold', fontSize: '24px', marginTop: '10px'}}
               >
                Enter your email
            </Typography>
            <StyledInput/>
            <Typography
               align="center"
               variant="h4"
               id="transition-modal-title"
               gutterBottom
               sx={{ fontWeight: 'bold', fontSize: '24px', marginTop: '10px'}}
               >
                Enter your Soundcloud handle
            </Typography>
            <StyledInput/>
            <Typography
               align="center"
               variant="h4"
               id="transition-modal-title"
               gutterBottom
               sx={{ fontWeight: 'bold', fontSize: '24px', marginTop: '10px'}}
               >
                Enter your Twitter handle
            </Typography>
            <StyledInput/>
            <Typography
               align="center"
               variant="h4"
               id="transition-modal-title"
               gutterBottom
               sx={{ fontWeight: 'bold', fontSize: '24px', marginTop: '10px'}}
               >
                Enter your email
            </Typography>
            <StyledInput/>
            </Box>
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const Root = styled('div')(({ theme, displaySmall }) => ({
  display: 'flex',
  alignItems: displaySmall ? 'right' : 'center',
  width: displaySmall ? '' : '100%',
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
}))

const StyledInput = styled('input')(({ theme }) => ({
  border: 0,
  borderBottom: '1px solid #000000',
  margin: '10px auto',
    width: '20vw',
  outline: 'none !important',
  background: 'transparent',
  outline: 'none',
  borderRadius: 0,
  textAlign: 'left',
  fontSize: '1rem',
  [theme.breakpoints.down('md')]: {
    margin: '15px 0',
    padding: '2px 0',
    width: '100vw',
    fontSize: '18px',
  },
}))
export default EmailCaptureModal
