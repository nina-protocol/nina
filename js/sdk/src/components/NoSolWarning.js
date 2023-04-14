import React, { useState, useEffect, useContext, useMemo } from 'react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from 'next/link'

const NoSolWarning = (props) => {
  const { requiredSol, action, open, setOpen } = props
  const [actionText, setActionText] = useState('')
  const [currency, setCurrency] = useState('SOL')
  useEffect(() => {
    switch (action) {
      case 'publish':
        return setActionText('upload a Release')
      case 'hub':
        return setActionText('create a Hub')
      case 'purchase':
        return setActionText('purchase this Release')
      default:
        break
    }
  }, [action, actionText])

  useEffect(() => {
    switch (action) {
      case 'publish':
      case 'hub':
        return setCurrency('SOL')
      case 'purchase':
        return setCurrency('USDC')
      default:
        break
    }
  }, [action, currency])

  const handleClose = () => {
    setOpen(false)
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
            <>
              <StyledTypography variant="h4" sx={{ paddingBottom: '16px' }}>
                {` You do not have enough ${currency} in your wallet to ${actionText}.`}
              </StyledTypography>
              <StyledTypography component="p" gutterBottom>
                {`${requiredSol} ${currency} is required to ${actionText}.`}
              </StyledTypography>
              <StyledTypography component="p" gutterBottom>
                {`You currently have 0
            ${currency} in your wallet.`}
              </StyledTypography>
              <StyledTypography component="p" gutterBottom>
                {`Please add more ${currency} to your wallet to ${actionText}.`}
              </StyledTypography>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <StyledTypography component="p" gutterBottom>
                  {`For any questions, please reach out to us at `}
                </StyledTypography>
                <Link href="mailto:contact@ninaprotocol.com">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    style={{ margin: '0px', textDecoration: 'none' }}
                  >
                    <ContactTypography component="p">
                      {`contact@ninaprotocol.com`}
                    </ContactTypography>
                  </a>
                </Link>
                <StyledTypography component="p" gutterBottom>
                  {`.`}
                </StyledTypography>
              </Box>
              <Button
                style={{ marginTop: '15px' }}
                color="primary"
                variant="outlined"
                onClick={handleClose}
              >
                <Typography>Got it</Typography>
              </Button>
            </>
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
}))

const StyledTypography = styled(Typography)(() => ({
  marginBottom: '20px',
}))

const ContactTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.blue,
  marginTop: '0px',
  marginBottom: '0px',
  marginLeft: '6px',
  textDecoration: 'none',
}))

export default NoSolWarning
