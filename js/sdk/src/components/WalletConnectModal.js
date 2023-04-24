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
import EmailLoginForm from './EmailLoginForm'
import EmailOTPForm from './EmailOTPForm'

const WalletConnectModal = (props) => {
  const { children, inOnboardingFlow, action, forceOpen, setForceOpen } = props
  const { wallet, walletExtension, connectMagicWallet, useMagic } = useContext(
    Wallet.Context
  )
  const [signingUp, setSigningUp] = useState(false)
  const [showOtpUI, setShowOtpUI] = useState(false)
  const [otpLogin, setOtpLogin] = useState(undefined)
  const [showWallets, setShowWallets] = useState(false)
  const [pending, setPending] = useState(false)
  const [actionText, setActionText] = useState('')
  const [open, setOpen] = useState(false)
  const walletText = useMemo(() => {
    return signingUp
      ? 'I want to sign up with a wallet'
      : 'I want to Login with a wallet'
  }, [signingUp])
  const [email, setEmail] = useState()

  const handleWalletCollapse = () => {
    localStorage.setItem('nina_magic_wallet', showWallets)
    setShowWallets(!showWallets)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersMagicWallet = localStorage.getItem('nina_magic_wallet')
      if (prefersMagicWallet === 'false' || prefersMagicWallet === null) {
        setShowWallets(true)
      }
    }
  }, [])
  useEffect(() => {
    switch (action) {
      case 'collect':
        return setActionText('collect this Release')
      case 'purchase':
        return setActionText('purchase this Release')
      case 'repost':
        return setActionText('repost this Release')
      case 'sellOffer':
        return setActionText('create this listing')
      case 'buyOffer':
        return setActionText('create this buy offer')
      case 'acceptOffer':
        return setActionText('complete this exchange')
      case 'redeemRelease':
        return setActionText('redeem this Release code')
      default:
        break
    }
  }, [action])

  useEffect(() => {
    if (forceOpen) {
      setOpen(true)
    }
  }, [forceOpen])

  const handleLogin = async (email) => {
    setPending(true)
    const magic = await useMagic()
    try {
      localStorage.setItem('nina_magic_wallet', 'true')
      const otpLogin = magic.auth.loginWithEmailOTP({ email, showUI: false })
      otpLogin
        .on('email-otp-sent', () => {
          setOtpLogin(otpLogin)
          setShowOtpUI(true)
          setPending(false)
        })
        .on('done', () => {
          connectMagicWallet(magic)
        })
        .on('settled', () => {
          setOtpLogin()
          setShowOtpUI(false)
          handleClose()
        })
        .catch((err) => {
          console.error('magic login error: ', err)
        })
    } catch (err) {
      console.error(err)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setForceOpen(false)
    setShowOtpUI(false)
    setSigningUp(false)
    setEmail()
    setPending(false)
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
    localStorage.setItem('nina_magic_wallet', 'false')
    wallet.select(walletName)
    setOpen(false)
  }

  return (
    <Box>
      {/* {!actionText && ( */}
      <>
        {inOnboardingFlow ? (
          <Button
            onClick={() => {
              if (wallet?.connected) {
                wallet.disconnect()
              } else {
                setOpen(true)
                setSigningUp(true)
              }
            }}
            variant="outlined"
            style={{ width: '100%' }}
          >
            {children}
          </Button>
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
      </>
      {/* )} */}

      <StyledModal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <StyledPaper>
            {actionText && (
              <Typography mb={1}>{`Please Login to ${actionText}.`}</Typography>
            )}
            {showOtpUI ? (
              <EmailOTPForm
                login={otpLogin}
                email={email}
                pending={pending}
                setPending={setPending}
              />
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

            {!showOtpUI && (
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
                        <Typography>{wallet.adapter.name}</Typography>
                      </Button>
                    ))}
                  </WalletButtons>
                </Collapse>
              </Box>
            )}
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
  [theme.breakpoints.down('md')]: {
    width: '90vw',
    padding: theme.spacing(2),
  },
}))

const WalletButtons = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}))
export default WalletConnectModal
