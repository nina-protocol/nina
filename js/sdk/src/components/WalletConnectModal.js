import React, { useState, useContext, useMemo, useEffect } from 'react'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { Magic } from 'magic-sdk'
import { SolanaExtension } from '@magic-ext/solana'
import EmailLoginForm from './EmailLoginForm'
import EmailOTPForm from './EmailOTPForm'


const WalletConnectModal = (props) => {
  const { children, inOnboardingFlow } = props
  const { wallet, walletExtension, connectMagicWallet } = useContext(
    Wallet.Context
  )

  const [open, setOpen] = useState(false)
  const [signingUp, setSigningUp] = useState(false)
  const [showOtpUI, setShowOtpUI] = useState(false)
  const [otpLogin, setOtpLogin] = useState(undefined)
  const [showWallets, setShowWallets] = useState(false)
  const [pending, setPending] = useState(false)
  const walletText = useMemo(() => {
   return signingUp ? 'I want to sign up with a wallet' : 'I want to login with a wallet'
  }, [signingUp])
  const [email, setEmail] = useState()

  const handleWalletCollapse = () => {
    localStorage.setItem('nina_magic_wallet', showWallets)
    setShowWallets(!showWallets)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersMagicWallet = localStorage.getItem('nina_magic_wallet')
      if (prefersMagicWallet === 'false') {
        console.log('in here');
        setShowWallets(true)
      }
    }
  }, [])

  const handleLogin = async (email) => {
    setPending(true)
    const magic = new Magic(process.env.MAGIC_KEY, {
      extensions: {
        solana: new SolanaExtension({
          rpcUrl: process.env.SOLANA_CLUSTER_URL,
        }),
      },
    })

    try {
      // setOtpLogin()
      localStorage.setItem('nina_magic_wallet', 'true')

      console.log('localStorage.nina_magic_wallet :>> ', localStorage.nina_magic_wallet);
      const otpLogin = magic.auth.loginWithEmailOTP({ email, showUI: false })
      otpLogin
        .on('invalid-email-otp', () => {
          console.log('invalid email OTP')
        })
        .on('verify-email-otp', (otp) => {
          console.log('verify email OTP', otp)
        })
        .on('email-otp-sent', () => {
          console.log('on email OTP sent!')

          setOtpLogin(otpLogin)
          setShowOtpUI(true)
          setPending(false)
        })
        .on('done', (result) => {
          connectMagicWallet(magic)

          console.log(`DID Token: %c${result}`, 'color: orange')
        })
        .on('settled', () => {
          setOtpLogin()
          setShowOtpUI(false)
        })
        .catch((err) => {
          console.log('%cError caught during login:\n', 'color: orange')

          console.log(err)
        })
    } catch (err) {
      console.error(err)
    }
  }
  const supportedWallets = useMemo(() => {
    if (walletExtension) {
      return walletExtension.wallets.filter(
        (wallet) => wallet.readyState !== WalletReadyState.Unsupported
      )
    }
  }, [walletExtension])

  const handleWalletClickEvent = (event, walletName) => {
    event.preventDefault()
    wallet.select(walletName)
    setOpen(false)
  }

  return (
    <Box>
      {inOnboardingFlow ? (
        <StyledButton
          onClick={() => {
            if (wallet?.connected) {
              wallet.disconnect()
            } else {
              setOpen(true)
              setSigningUp(true)
            }
          }}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          {children}
        </StyledButton>
      ) : (
        <Box>
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
              fontSize: '14px',
              '&:hover': {
                opacity: '50%',
              },
            }}
          >
              {children}
          </Button>
        </Box>

        
      )}
      <StyledModal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={() => {
          setSigningUp(false) 
          setOpen(false)
        }}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <StyledPaper>
            {signingUp && (
              <Box sx={{mb:1}}>
                <Typography variant='body1'>To create an account, all you need is an email.</Typography>
              </Box>
            )}
            {showOtpUI ? (
              <EmailOTPForm login={otpLogin} email={email} pending={pending} setPending={setPending} />
            ) : (
              <EmailLoginForm
                handleEmailLoginCustom={handleLogin}
                email={email}
                setEmail={setEmail}
                signingUp={signingUp}
                pending={pending}
                setPending={setPending}
              />
            )}

            <Box sx={{ mt: 1 }}>
              <Typography onClick={handleWalletCollapse}>
                <a style={{ textDecoration: 'underline' }}>
                  {showWallets ? 'Hide Wallets' : walletText}
                </a>
              </Typography>

              <Collapse in={showWallets} timeout="auto" unmountOnExit>
                <WalletButtons>
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
                      <Typography>
                        {wallet.adapter.name}
                      </Typography>
                    </Button>
                  ))}
                </WalletButtons>
              </Collapse>
            </Box>
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Box>
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

const WalletButtons = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}))

const StyledButton = styled(Button)(({ theme }) => ({
  // border: `1px solid ${theme.palette.black}`,
  // borderRadius: '0px',
  // padding: '16px 20px',
  // color: theme.palette.black,
  width: '100%',
  // fontSize: '12px',
}))

export default WalletConnectModal
