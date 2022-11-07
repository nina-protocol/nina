import React, { useState, useContext, useMemo } from 'react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import AutorenewIcon from '@mui/icons-material/Autorenew'

const UploadInfoModal = ({ userHasSeenUpdateMessage }) => {
  const [open, setOpen] = useState(userHasSeenUpdateMessage ? false : true)
  const { bundlrPricePerMb } = useContext(Nina.Context)

  const mbPerTenthSol = useMemo(() => {
    return 0.1 / bundlrPricePerMb
  }, [bundlrPricePerMb])

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
        sx={{ height: '22px', width: '28px', m: 0 }}
      >
        <AutorenewIcon sx={{ color: 'white' }} />
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
            <StyledTypography variant="h4" gutterBottom>
              Update to Publishing:
            </StyledTypography>
            <StyledTypography>
              We are now using{' '}
              <a
                href="https://bundlr.network/"
                target="_blank"
                style={{ textDecoration: 'underline' }}
                rel="noreferrer"
              >
                Bundlr
              </a>{' '}
              to allow artists to directly upload their releases to Arweave.
            </StyledTypography>
            <StyledTypography>
              This update brings us closer to permissionless access and expands
              file size limitations.
            </StyledTypography>
            <StyledTypography>
              After closing this window, you will see a button that enables the
              Upload Account interface. You will need to deposit SOL in order to
              publish a release.
            </StyledTypography>
            <StyledTypography>
              0.1 SOL will cover ~{mbPerTenthSol.toFixed(2)} MBs. Any SOL you
              don&apos;t use on this release will be saved in your Upload
              Account for your next release. You can withdraw from you account
              at any time by clicking &apos;Manage Upload Account&apos; on the
              Upload page.
            </StyledTypography>
            <StyledTypography>
              If you have any questions or need assitance, please reach out to
              contact@ninaprotocol.com or hop into{' '}
              <a
                href="https://discord.gg/Uu7U6VKHwj"
                target="_blank"
                style={{ textDecoration: 'underline' }}
                rel="noreferrer"
              >
                our discord
              </a>
              .
            </StyledTypography>

            <Button
              style={{ marginTop: '15px' }}
              color="primary"
              variant="outlined"
              onClick={handleClose}
            >
              <Typography>Got it!</Typography>
            </Button>
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const Root = styled('div')(({ theme }) => ({
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

const StyledTypography = styled(Typography)(({ theme }) => ({
  marginBottom: '20px',
}))
export default UploadInfoModal
