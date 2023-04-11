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
import EmailLoginForm from './EmailLoginForm'
import EmailOTPForm from './EmailOTPForm'

const WalletConnectModal = ({ children }) => {
  const { wallet, walletExtension, connectMagicWallet } = useContext(
    Wallet.Context
  )

  const [open, setOpen] = useState(false)
  const [showOtpUI, setShowOtpUI] = useState(false);
  const [otpLogin, setOtpLogin] = useState();

  const handleLogin = async (email) => {
    const magic = new Magic(process.env.MAGIC_KEY, {
      extensions: {
        solana: new SolanaExtension({
          rpcUrl: process.env.SOLANA_CLUSTER_URL,
        }),
      },
    })
  
    console.log('bruh email', email, magic)
    try {
      setOtpLogin();
      const otpLogin = magic.auth.loginWithEmailOTP({ email, showUI: false });
      console.log('otpLogin', otpLogin)
      otpLogin
        .on('invalid-email-otp', () => {
          console.log('invalid email OTP');
        })
        .on('verify-email-otp', (otp) => {
          console.log('verify email OTP', otp);
        })
        .on("email-otp-sent", () => {
          console.log("on email OTP sent!");

          setOtpLogin(otpLogin);
          setShowOtpUI(true);
        })
        .on("done", (result) => {
          connectMagicWallet(magic);

          console.log(`DID Token: %c${result}`, "color: orange");
        })
        .on("settled", () => {
          setOtpLogin();
          setShowOtpUI(false);
        })
        .catch((err) => {
          console.log("%cError caught during login:\n", "color: orange");

          console.log(err);
        });
      console.log('beep')
    } catch (err) {
      console.error(err);
    }
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
            {showOtpUI ? (
              <EmailOTPForm login={otpLogin} />
            ) : (
              <EmailLoginForm handleEmailLoginCustom={handleLogin} />
            )}
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
