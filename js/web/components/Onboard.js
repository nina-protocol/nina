import React, { useEffect, useState, useContext, useMemo } from 'react'
import axios from 'axios'
import { encodeBase64 } from 'tweetnacl-util'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Box from '@mui/system/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import WalletConnectModal from '@nina-protocol/nina-internal-sdk/esm/WalletConnectModal'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepContent from '@mui/material/StepContent'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import IdentityVerification from '@nina-protocol/nina-internal-sdk/esm/IdentityVerification'
import Dots from '@nina-protocol/nina-internal-sdk/esm/Dots'
import { logEvent } from '@nina-protocol/nina-internal-sdk/src/utils/event'
import LocalizedStrings from 'react-localization'
import dynamic from 'next/dynamic'

const Onboard = ({ customCode }) => {
  const router = useRouter()
  const {
    getBundlrBalance,
    getBundlrPricePerMb,
    getSolPrice,
    getUserBalances,
    verificationState,
    solBalance,
  } = useContext(Nina.Context)
  const { query } = router
  const [code, setCode] = useState()
  const { wallet, pendingTransactionMessage } = useContext(Wallet.Context)
  const [claimedError, setClaimedError] = useState(false)
  const [claimedCodeSuccess, setClaimedCodeSuccess] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const { enqueueSnackbar } = useSnackbar()
  const profilePubkey = wallet?.publicKey?.toBase58()
  const [profileVerifications, setProfileVerifications] = useState([])
  const [pending, setPending] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  useEffect(() => {
    refreshBundlr()
    getUserBalances()
  }, [])
  useEffect(() => {
    if (!router.isReady) return
    if (router.isReady && query.claim) {
      const onboardingCodeString = query.claim.toString()
      const formattedOnboardingCodeString = onboardingCodeString.replaceAll(
        '/',
        ''
      )
      if (formattedOnboardingCodeString) {
        localStorage.setItem('onboardingCode', formattedOnboardingCodeString)
        setCode(formattedOnboardingCodeString)
      }
    }
  }, [router.isReady])

  useEffect(() => {
    if (customCode) {
      setCode(customCode)
    }
  }, [customCode])

  useEffect(() => {
    if (verificationState[profilePubkey]) {
      setProfileVerifications(verificationState[profilePubkey])
    }
  }, [verificationState])

  useEffect(() => {
    if (wallet.connected) {
      setActiveStep(1)
      getUserBalances()
    }
  }, [wallet.connected])

  useEffect(() => {
    if (claimedCodeSuccess) {
      setActiveStep(2)
    }
  }, [claimedCodeSuccess])

  const onboardingCopy = new LocalizedStrings({
    en: {
      title: 'Welcome to Nina.',
      signInStep: {
        header: 'Sign In / Sign Up',
        content: 'To get started, please sign in or sign up below.',
      },
      claimStep: {
        header: 'Claim your invite code',
        context: `By claiming this code you'll receive 0.15 SOL to get started in the Nina ecosystem.`,
      },
      fundUploadAccountStep: {
        header: 'Fund your Upload Account',
        content: `You now have 0.15 SOL into your account. SOL is used to pay storage and transaction fees on Nina. Once you've claimed your code, you'll need to fund your Upload Account.`,
      },
      verifyAccountStep: {
        header: 'Verify your Account (optional)',
        content: `You can verify your account via your Soundcloud or Twitter profile.`,
      },
      successStep: {
        header: 'Success',
        content: `You're all set. ${
          solBalance > 0
            ? 'You can now start uploading your music to Nina.'
            : ''
        }`,
      },
    },
    ja: {
      title: 'Welcome to Nina.',
      signInStep: {
        header: 'Sign In / Sign Up',
        content: `サインインまたは登録してください。`,
      },
      claimStep: {
        header: 'Invite codeを入力してください',
        content: `このコードを入力することによって、Ninaを始めるために必要な0.15 SOLを受け取ることができます。`,
      },
      fundUploadAccountStep: {
        header: `アップロードアカウントに供給する`,
        content: `今アカウントに0.15 SOLはいっています。SOLはNina上で保存と取引に使用されます。一度コードを入力したら、アップロードアカウントに供給する必要があります。このアカウントはNina上で保存し取引するために使用されます。`,
      },
      verifyAccountStep: {
        header: `アカウントを照合する（オプション`,
        content: `SoundcloudやTwitterのプロフィールを照合することができます。`,
      },
      successStep: {
        header: `成功`,
        content: `準備ができました。${
          solBalance > 0 ? 'Ninaに音楽をアップロードすることができます。' : ''
        }`,
      },
    },
  })

  // uncomment to see japanese copy
  // onboardingCopy.setLanguage('ja')

  const onboardingSteps = [
    {
      title: onboardingCopy.signInStep.header,
      content: onboardingCopy.signInStep.content,
      cta: (
        <WalletConnectModal
          inOnboardingFlow={true}
          forceOpen={showWalletModal}
          setForceOpen={setShowWalletModal}
        >
          <Typography variant="body2">Continue</Typography>
        </WalletConnectModal>
      ),
    },
    {
      title: onboardingCopy.claimStep.header,
      content: onboardingCopy.claimStep.content,

      cta: (
        <>
          <Typography mb={1}>
            Your invite code is:
            <Typography mb={1} mt={1} sx={{ fontFamily: 'monospace' }}>
              {code}
            </Typography>
          </Typography>
          <Button
            variant="outlined"
            onClick={() => handleClaimCode(code, customCode)}
          >
            {pending ? (
              <Dots size="40px" msg={pendingTransactionMessage} />
            ) : (
              'Claim Code'
            )}
          </Button>
          {claimedError && (
            <Typography mt={1} mb={1}>
              This code has already been claimed or is invalid. If you believe
              this is an error, please contact us at{' '}
              <a
                href="mailto:contact@ninaprotocol.com"
                target="_blank"
                rel="noreferrer"
              >
                contact@ninaprotocol.com
              </a>
              .
            </Typography>
          )}
        </>
      ),
    },
    {
      title: onboardingCopy.verifyAccountStep.header,
      content: onboardingCopy.verifyAccountStep.content,
      cta: (
        <>
          <IdentityVerification
            verifications={profileVerifications}
            profilePubkey={profilePubkey}
            inOnboardingFlow={true}
          />
          <Box />
          <Button
            variant="outlined"
            onClick={() => setActiveStep(3)}
            sx={{ marginTop: '10px', width: '100%' }}
          >
            <Typography variant="body2">Continue</Typography>
          </Button>
        </>
      ),
    },
    {
      title: onboardingCopy.successStep.header,
      content: onboardingCopy.successStep.content,
      cta: (
        <>
          {solBalance > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              <Link href="/dashboard">
                <Button
                  variant="outlined"
                  sx={{ marginTop: '10px', width: '100%' }}
                >
                  Go to Dashboard
                </Button>
              </Link>

              <Link href="/hubs/create">
                <Button
                  variant="outlined"
                  sx={{ marginTop: '10px', width: '100%' }}
                  disabled={solBalance === 0}
                >
                  Create a Hub
                </Button>
              </Link>

              <Link href="/upload">
                <Button
                  variant="outlined"
                  width={'100%'}
                  sx={{ marginTop: '10px', width: '100%' }}
                  disabled={solBalance === 0}
                >
                  Publish a Track
                </Button>
              </Link>
            </Box>
          )}

          {solBalance === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: 'max-content',
              }}
            >
              <Link href="/">
                <Typography gutterBottom component={'a'}>
                  Visit the Homepage to start exploring
                </Typography>
              </Link>
            </Box>
          )}
        </>
      ),
    },
  ]

  const signUpSteps = [
    {
      title: onboardingCopy.signInStep.header,
      content: onboardingCopy.signInStep.content,
      cta: (
        <>
          <WalletConnectModal
            inOnboardingFlow={true}
            forceOpen={showWalletModal}
            setForceOpen={setShowWalletModal}
          >
            <Typography variant="body2">Continue</Typography>
          </WalletConnectModal>
        </>
      ),
    },
    {
      title: onboardingCopy.verifyAccountStep.header,
      content: onboardingCopy.verifyAccountStep.content,
      cta: (
        <>
          <IdentityVerification
            verifications={profileVerifications}
            profilePubkey={profilePubkey}
            inOnboardingFlow={true}
          />
          <Box />
          <Button
            variant="outlined"
            onClick={() => setActiveStep(2)}
            sx={{ marginTop: '10px', width: '100%' }}
          >
            <Typography variant="body2">Continue</Typography>
          </Button>
        </>
      ),
    },
    {
      title: onboardingCopy.successStep.header,
      content: onboardingCopy.successStep.content,
      cta: (
        <>
          {solBalance > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              <Link href="/dashboard">
                <Button
                  variant="outlined"
                  sx={{ marginTop: '10px', width: '100%' }}
                >
                  Go to Dashboard
                </Button>
              </Link>

              <Link href="/hubs/create">
                <Button
                  variant="outlined"
                  sx={{ marginTop: '10px', width: '100%' }}
                  disabled={solBalance === 0}
                >
                  Create a Hub
                </Button>
              </Link>

              <Link href="/upload">
                <Button
                  variant="outlined"
                  width={'100%'}
                  sx={{ marginTop: '10px', width: '100%' }}
                  disabled={solBalance === 0}
                >
                  Publish a Track
                </Button>
              </Link>
            </Box>
          )}

          {solBalance === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: 'max-content',
              }}
            >
              <Link href="/">
                <Typography gutterBottom component={'a'}>
                  Visit the Homepage to start exploring
                </Typography>
              </Link>
            </Box>
          )}
        </>
      ),
    },
  ]

  const handleClaimCode = async (code, customCode) => {
    const message = new TextEncoder().encode(wallet.publicKey.toBase58())
    const messageBase64 = encodeBase64(message)
    const signature = await wallet.signMessage(message)
    const signatureBase64 = encodeBase64(signature)
    logEvent('claim_onboard_code_initiated', 'engagement', {
      wallet: wallet?.publicKey?.toBase58(),
    })

    const url = customCode
      ? `bulkOnboardingCodes/${customCode}`
      : `onboardingCodes/${code}`
    try {
      setPending(true)
      const response = await axios.post(
        `${process.env.NINA_IDENTITY_ENDPOINT}/${url}`,
        {
          message: messageBase64,
          signature: signatureBase64,
          publicKey: wallet.publicKey.toBase58(),
        }
      )
      if (response.data.status === 'success') {
        logEvent('claim_onboard_code_success', 'engagement', {
          wallet: wallet?.publicKey?.toBase58(),
        })

        enqueueSnackbar('Code has been successfully redeemed', {
          info: 'success',
          variant: 'success',
        })
        setClaimedError(false)
        setClaimedCodeSuccess(true)
      }
      return
    } catch (error) {
      logEvent('claim_onboard_code_failure', 'engagement', {
        wallet: wallet?.publicKey?.toBase58(),
      })

      enqueueSnackbar('Code has already been redeemed or is invalid', {
        variant: 'error',
      })
      console.error(error)
      setClaimedError(true)
    }
    setPending(false)
  }

  const refreshBundlr = () => {
    getBundlrBalance()
    getBundlrPricePerMb()
    getSolPrice()
  }

  const renderSteps = (steps) => {
    return (
      <Box sx={{ width: '75%' }}>
        {customCode === 'avyss' && (
          <Typography mb={1} variant="h3">
            Welcome to Nina from Avyss
          </Typography>
        )}
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => {
            return (
              <NinaStep key={index}>
                <StepLabel>{step.title}</StepLabel>
                <StepContent>
                  <Typography variant="body1" mb={1}>
                    {step.content}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '75%',
                    }}
                  >
                    {step.cta}
                  </Box>
                </StepContent>
              </NinaStep>
            )
          })}
        </Stepper>
      </Box>
    )
  }

  return (
    <StyledGrid>
      <GetStartedPageWrapper>
        <>
          <Box mb={2}>
            {!customCode && (
              <Typography variant="h1" mb={1}>
                Welcome to Nina{code !== undefined ? '.' : ','}
              </Typography>
            )}
            {code !== undefined && (
              <>
                {!customCode && (
                  <>
                    <Typography variant="h3" mb={1}>
                      You are receiving complimentary SOL to create your Hub and
                      start uploading your music.
                    </Typography>
                    <Typography variant="h3" mb={1}>
                      Please follow the steps below to get started.
                    </Typography>
                  </>
                )}
                {renderSteps(onboardingSteps)}
              </>
            )}

            {code === undefined && (
              <>
                <Typography variant="h1" mb={1} sx={{ color: '#2D81FF' }}>
                  an independent music ecosystem.
                </Typography>
                <Typography variant="h3" mb={1}>
                  To get started releasing, collecting, and discovering music,
                  please sign in or sign up below.
                </Typography>
                {renderSteps(signUpSteps)}
              </>
            )}
          </Box>
        </>
      </GetStartedPageWrapper>
    </StyledGrid>
  )
}

const StyledGrid = styled(Grid)(({ theme }) => ({
  paddingTop: '20px',
  maxHeight: '90vh',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  '& a': {
    textDecoration: 'none',
    color: theme.palette.blue,
    '&:hover': {
      opacity: '50%',
    },
  },
}))

const GetStartedPageWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: '0px auto ',
  display: 'flex',
  flexDirection: 'column',
  gridColumn: '1/3',
  maxWidth: '1000px',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    width: '80%',
    margin: '25px auto',
    paddingBottom: '100px',
  },
}))

const NinaStep = styled(Step)(({ theme }) => ({
  '& .MuiStepLabel-iconContainer .Mui-completed': {
    color: theme.palette.blue,
  },
  '& .MuiStepLabel-iconContainer .Mui-active': {
    color: theme.palette.blue,
  },
  '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel': {
    color: theme.palette.black,
  },
  '& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
    fill: theme.palette.white,
  },
}))
export default Onboard
