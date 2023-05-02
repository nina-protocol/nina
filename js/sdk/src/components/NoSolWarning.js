import React, { useState, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import EmailCapture from '@nina-protocol/nina-internal-sdk/esm/EmailCapture'
import { Collapse } from '@mui/material'

const NoSolWarning = (props) => {
  const { action, open, setOpen } = props
  const [actionText, setActionText] = useState('')
  const [childFormOpen, setChildFormOpen] = useState(false)

  useEffect(() => {
    switch (action) {
      case 'upload':
        return setActionText('upload a Release')
      case 'hub':
        return setActionText('create a Hub')
      case 'purchase':
        return setActionText('purchase this Release')
      case 'sellOffer':
        return setActionText('create this listing')
      case 'buyOffer':
        return setActionText('create this buy offer')
      case 'acceptOffer':
        return setActionText('complete this exchange')
      default:
        break
    }
  }, [action])

  const handleClose = () => {
    setOpen(false)
    setChildFormOpen(false)
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
              <Collapse in={!childFormOpen}>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {`You do not have any SOL.`}
                </Typography>

                <Typography component="p" sx={{ mb: 1 }}>
                  {`Please add SOL to your wallet to ${actionText}.`}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Typography component="p" gutterBottom>
                    {`For any questions, please reach out at`}{' '}
                    <a
                      target="_blank"
                      rel="noreferrer"
                      style={{ margin: '0px', textDecoration: 'none' }}
                      href="mailto:contact@ninaprotocol.com"
                    >
                      {`contact@ninaprotocol.com`}
                    </a>{' '}
                    {`or our`}{' '}
                    <a
                      target="_blank"
                      rel="noreferrer"
                      style={{ margin: '0px', textDecoration: 'none' }}
                      href="https://discord.gg/ePkqJqSBgj"
                    >
                      {`Discord`}
                    </a>
                    {'.'}
                  </Typography>
                </Box>

                <Button
                  style={{
                    marginTop: '15px',
                    marginBottom: '15px',
                    width: '100%',
                  }}
                  color="primary"
                  variant="outlined"
                  onClick={handleClose}
                >
                  <Typography>Okay</Typography>
                </Button>
              </Collapse>

              {(action === 'upload' || action === 'hub') && (
                <>
                  <EmailCapture
                    setChildFormOpen={setChildFormOpen}
                    setParentOpen={setOpen}
                  />
                </>
              )}
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
  a: {
    color: theme.palette.blue,
  },
}))

export default NoSolWarning
