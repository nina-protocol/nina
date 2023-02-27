import React, { useState, useContext, useMemo } from 'react'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { WalletReadyState } from '@solana/wallet-adapter-base'

const WalletConnectModal = ({ children }) => {
  const { wallet, walletExtension, connectWalletEmbed } = useContext(
    Wallet.Context
  )

  const [open, setOpen] = useState(false)

  const supportedWallets = useMemo(() => {
    if (walletExtension) {
      return walletExtension.wallets.filter(
        (wallet) => wallet.readyState !== WalletReadyState.Unsupported
      )
    }
  }, [walletExtension])

  const handleClose = () => {
    setOpen(false)
  }

  const handleWalletClickEvent = (event, walletName) => {
    event.preventDefault()
    wallet.select(walletName)
    setOpen(false)
  }

  return (
    <Root>
      <Button
        onClick={() => {
          if (wallet?.connected) {
            wallet.disconnect()
          } else {
            setOpen(true)
          }
        }}
        sx={{
          '&:hover': {
            opacity: '50%',
          },
        }}
      >
        {children}
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
            <Button
              style={{ marginTop: '15px' }}
              color="primary"
              variant="outlined"
              onClick={async () => {
                await connectWalletEmbed()
                handleClose()
              }}
            >
              <Typography>Log in with Google Account</Typography>
            </Button>
            {supportedWallets?.map((wallet) => (
              <Button
                key={wallet.adapter.name}
                style={{ marginTop: '15px' }}
                color="primary"
                variant="outlined"
                onClick={(event) =>
                  handleWalletClickEvent(event, wallet.adapter.name)
                }
              >
                <Typography>Connect Wallet: {wallet.adapter.name}</Typography>
              </Button>
            ))}
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

export default WalletConnectModal
