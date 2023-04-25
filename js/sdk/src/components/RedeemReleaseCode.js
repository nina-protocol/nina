import React, { useState, useContext } from 'react'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'
import Input from '@mui/material/Input'
import { encodeBase64 } from 'tweetnacl-util'
import { useSnackbar } from 'notistack'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import axios from 'axios'
import dynamic from 'next/dynamic'
import Dots from './Dots'
const WalletConnectModal = dynamic(() =>
  import('@nina-protocol/nina-internal-sdk/esm/WalletConnectModal')
)

const RedeemReleaseCode = (props) => {
  const { releasePubkey } = props
  const { enqueueSnackbar } = useSnackbar()
  const { getRelease } = useContext(Release.Context)
  const { addReleaseToCollection } = useContext(Nina.Context)
  const { wallet } = useContext(Wallet.Context)
  const [open, setOpen] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [code, setCode] = useState()
  const [pending, setPending] = useState(false)

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    if (!wallet?.connected) {
      setShowWalletModal(true)
      return
    }
    try {
      if (wallet?.connected) {
        setPending(true)
        const message = new TextEncoder().encode(releasePubkey)
        const messageBase64 = encodeBase64(message)
        const signature = await wallet.signMessage(message)
        const signatureBase64 = encodeBase64(signature)
        await axios.post(
          `${process.env.NINA_IDENTITY_ENDPOINT}/releaseCodes/${code}/claim`,
          {
            publicKey: wallet?.publicKey?.toBase58(),
            message: messageBase64,
            signature: signatureBase64,
            releasePublicKey: releasePubkey,
          }
        )
        await getRelease(releasePubkey)
        await addReleaseToCollection(releasePubkey)
        enqueueSnackbar('Release code redeemed!', {
          variant: 'success',
        })
        setOpen(false)
        setCode('')
        setPending(false)
      }
    } catch (error) {
      setPending(false)
      enqueueSnackbar('Code is either invalid or already claimed.', {
        variant: 'error',
      })
    }
  }

  return (
    <Root>
      <StyledButton onClick={() => setOpen(true)}>
        Redeem Release Code
      </StyledButton>
      <WalletConnectModal
        inOnboardingFlow={false}
        forceOpen={showWalletModal}
        setForceOpen={setShowWalletModal}
        action={'redeemRelease'}
      />
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
            <StyledCloseIcon onClick={() => setOpen(false)} />
            <StyledTypography variant="body1" mb={1}>
              Enter your code below:
            </StyledTypography>

            <Input
              type="text"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Box mb={1}></Box>

            <Button
              variant="outlined"
              fullWidth
              onClick={(e) => handleCodeSubmit(e)}
            >
              <Typography variant="body2">
                {pending ? <Dots size="40px" /> : 'Redeem'}
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
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  position: 'relative',
}))

const StyledButton = styled(Button)(({ theme }) => ({
  textDecoration: 'underline',
  padding: '0px',
  marginTop: '0px',
  color: theme.palette.grey[500],
  textTransform: 'capitalize',
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
const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.black,
}))

const StyledCloseIcon = styled(CloseIcon)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  cursor: 'pointer',
  color: theme.palette.black,
}))

export default RedeemReleaseCode
