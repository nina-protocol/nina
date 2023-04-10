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
import { Magic } from 'magic-sdk'
import { SolanaExtension } from '@magic-ext/solana'

const WalletConnectModal = (props) => {
  const { children, inOnboardingFlow } = props
  const { wallet, walletExtension, connectMagicWallet } = useContext(
    Wallet.Context
  )

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async () => {
    const magic = new Magic(process.env.MAGIC_KEY, {
      extensions: {
        solana: new SolanaExtension({
          rpcUrl: process.env.SOLANA_CLUSTER_URL,
        }),
      },
    })
    await connectMagicWallet(magic, email)
  }

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
    <>
      {inOnboardingFlow ? (
        <StyledButton
          onClick={() => {
            if (wallet?.connected) {
              wallet.disconnect()
            } else {
              setOpen(true)
            }
          }}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          {children}
        </StyledButton>
      ) : (
        <Button
          onClick={() => {
            if (wallet?.connected) {
              wallet.disconnect()
            } else {
              setOpen(true)
            }
          }}
          sx={{
            padding: '0px',
            textTransform: 'none',
            '&:hover': {
              opacity: '50%',
            },
          }}
        >
          <Typography variant="h3" sx={{ textAlign: 'center' }}>
            {children}
          </Typography>
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
            <input
              id="email"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              style={{ marginTop: '15px' }}
              color="primary"
              variant="outlined"
              onClick={async () => {
                await handleLogin()
                handleClose()
              }}
            >
              <Typography>Log in with Email</Typography>
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
    </>
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
  display: 'flex',
  flexDirection: 'column',
}))

const StyledButton = styled(Button)(({ theme }) => ({
  border: `1px solid ${theme.palette.black}`,
  borderRadius: '0px',
  padding: '16px 20px',
  color: theme.palette.black,
  width: '100%',
  fontSize: '12px',
}))

export default WalletConnectModal
