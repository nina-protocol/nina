import React from 'react'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from 'next/link'
const LowSolWarningModal = ({ open, setOpen, requiredSol, availableSol }) => {
  return (
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
          <Typography
            variant="h5"
            component="h2"
            sx={{ paddingBottom: '16px' }}
          >
            You do not have enough SOL to publish a release
          </Typography>
          <ModalTypography variant="body1" component="p" gutterBottom>
            {`${requiredSol} SOL is required to publish a release.`}
          </ModalTypography>
          <ModalTypography variant="body1" component="p" gutterBottom>
            {`You currently have ${availableSol}
            SOL in your wallet.`}
          </ModalTypography>
          <ModalTypography variant="body1" component="p" gutterBottom>
            {`If you attempt to publish a release without enough SOL, the transaction will fail.`}
          </ModalTypography>

          <ModalTypography
            variant="body1"
            component="p"
            gutterBottom
            sx={{ display: 'flex', flexDirection: 'row' }}
          >
            {`For any questions, please reach out to us at `}
            <Link href="mailto:contact@ninaprotocol.com">
              <a target="_blank" rel="noreferrer">
                <ContactTypography
                  variant="body1"
                  component="p"
                  sx={{ marginLeft: '4px' }}
                >
                  {`contact@ninaprotocol.com`}
                </ContactTypography>
              </a>
            </Link>
            .
          </ModalTypography>

          <ModalButton
            color="primary"
            fullWidth
            variant="outlined"
            onClick={() => {
              setOpen(false)
            }}
          >
            <Typography variant="body1" sx={{ textDecoration: 'uppercase' }}>
              Okay
            </Typography>
          </ModalButton>
        </StyledPaper>
      </Fade>
    </StyledModal>
  )
}
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

const ModalTypography = styled(Typography)(() => ({
  marginBottom: '8px',
}))

const ModalButton = styled(Button)(() => ({
  marginTop: '16px',
  '&:hover': {
    opacity: 0.5,
  },
}))

const ContactTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.blue,
}))

export default LowSolWarningModal
