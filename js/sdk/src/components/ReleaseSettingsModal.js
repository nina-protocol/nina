import React, { useContext, useState } from 'react'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import SettingsIcon from '@mui/icons-material/Settings'
import Royalty from './Royalty'
import Gates from './Gates'
import Wallet from '../contexts/Wallet'
import CloseIcon from '@mui/icons-material/Close'
import CloseRelease from './CloseRelease'
import ReleaseSettingsWelcome from './ReleaseSettingsWelcome'
import ShareToTwitter from './ShareToTwitter'
import ReleaseCode from './ReleaseCode'

const ReleaseSettingsModal = ({
  releasePubkey,
  metadata,
  userIsRecipient,
  isAuthority,
  release,
  amountHeld,
  releaseGates,
}) => {
  const { wallet } = useContext(Wallet.Context)
  const { publicKey } = wallet

  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }
  return (
    <Root>
      {isAuthority && <ReleaseSettingsWelcome />}
      {(isAuthority || userIsRecipient) && (
        <Button
          onClick={() => setOpen(true)}
          sx={{
            height: '22px',
            width: '28px',
            m: 0,
            '&:hover': {
              opacity: '50%',
            },
          }}
        >
          <SettingsIcon sx={{ color: 'inherit' }} />
        </Button>
      )}

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
            <StyledCloseIcon onClick={() => handleClose()} />

            <StyledTypography variant="h4">Release Settings:</StyledTypography>

            {userIsRecipient && (
              <Royalty releasePubkey={releasePubkey} release={release} />
            )}
            <ShareToTwitter
              artist={metadata.properties.artist}
              title={metadata.properties.title}
              releasePubkey={releasePubkey}
            />
            {isAuthority && (
              <>
                <ReleaseCode release={releasePubkey} />
                <Gates
                  release={release}
                  metadata={metadata}
                  releasePubkey={releasePubkey}
                  isAuthority={isAuthority}
                  amountHeld={amountHeld}
                  inSettings={true}
                  releaseGates={releaseGates}
                />
                <CloseRelease releasePubkey={releasePubkey} release={release} />
              </>
            )}
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const Root = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
}))

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.black,
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
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    width: 'unset',
    margin: '15px',
    padding: theme.spacing(2),
  },
}))

const StyledCloseIcon = styled(CloseIcon)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.black,
  cursor: 'pointer',
}))

export default ReleaseSettingsModal
