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
import Tooltip, {TooltipProps, tooltipClasses} from '@mui/material/Tooltip';


import dynamic from 'next/dynamic'
import {render} from 'react-dom'

const BundlrModal = dynamic(() =>
  import('@nina-protocol/nina-internal-sdk/esm/BundlrModal')
)
const Onboard = () => {
  const router = useRouter()
  const {
    bundlrBalance,
    getBundlrBalance,
    getBundlrPricePerMb,
    solPrice,
    getSolPrice,
    getUserBalances,
    verificationState,
    solBalance
  } = useContext(Nina.Context)
  const { query } = router
  const [code, setCode] = useState()
  const { wallet } = useContext(Wallet.Context)
  const [claimedError, setClaimedError] = useState(false)
  const [claimedCodeSuccess, setClaimedCodeSuccess] = useState(false)
  const [activeStep, setActiveStep] = useState(2)
  const { enqueueSnackbar } = useSnackbar()
  const profilePubkey = wallet?.publicKey?.toBase58()
  const [profileVerifications, setProfileVerifications] = useState([])
  const bundlrUsdBalance = useMemo(
    () => bundlrBalance * solPrice,
    [bundlrBalance, solPrice]
  )
  useEffect(() => {
    refreshBundlr()
    getUserBalances()
  }, [])
  useEffect(() => {
    if (!router.isReady) return
    if (router.isReady && query.code) {
      const onboardingCodeString = query.code.toString()
      const formattedOnboardingCodeString = onboardingCodeString.replaceAll(
        '/',
        ''
      )
      if (formattedOnboardingCodeString) {
        setCode(formattedOnboardingCodeString)
      }
    }
  }, [router.isReady])

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
  useEffect(() => {
    if (bundlrUsdBalance > 0.05) {
      setActiveStep(3)
    }
  }, [bundlrUsdBalance])

  console.log('solBalance :>> ', solBalance);
  console.log('solBalance === 0 :>> ', solBalance === 0);

  const renderToolTop = (copy, link) => {
    return (
      <Box>
        <Box sx={{p: 3, border: '1px solid black'}}>
          <Typography variant="h4" sx={{color: 'black'}} gutterBottom>
           You need SOL to {copy}
           </Typography> 
           <Link href={link}>
            <a>
              Learn more.
            </a>
           </Link>
        </Box>
      </Box>
    )
  }

  const onboardingSteps = [
    {
      title: 'Login or Sign Up',
      content: `To get started, please login or sign up below.`,
      cta: (
        <WalletConnectModal inOnboardingFlow={true}>
          Login / Sign Up
        </WalletConnectModal>
      ),
    },
    {
      title: 'Claim your onboarding code',
      content: `   Once you've connected your wallet, you'll be able to claim your
          onboarding code. This code will give you access to the Nina ecosystem. Your onboarding code is: ${code}`,

      cta: (
        <>
          <ClaimCodeButton onClick={() => handleClaimCode(code)}>
            Claim Code
          </ClaimCodeButton>
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
      title: 'Fund your Upload Account',
      content: `  You now have .2 SOL into your account. SOL is used to pay storage and transaction fees on Nina. Once you've claimed your code, you'll need to fund your Upload
          Account. This account is used to pay for storage and transaction fees
          on Nina.`,
      cta: <BundlrModal inOnboardFlow={true} />,
    },
    {
      title: 'Verify your Account (optional)',
      content: `        Now that you have claimed your code and funded your account, you can
            verify your account via your Soundcloud or Twitter profile.`,
      cta: (
        <>
          <IdentityVerification
            verifications={profileVerifications}
            profilePubkey={profilePubkey}
            inOnboardingFlow={true}
          />
          <Box />
          <ClaimCodeButton
            onClick={() => setActiveStep(4)}
            sx={{ marginTop: '10px' }}
          >
            Do this Later
          </ClaimCodeButton>
        </>
      ),
    },
    {
      title: `Success`,
      content: `You're all set. You can now start uploading your music to Nina.`,
      cta: (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          <Link href="/dashboard">
            <ClaimCodeButton sx={{ marginTop: '10px' }}>
              Go to Dashboard
            </ClaimCodeButton>
          </Link>
          <Link href="/hubs/create">
            <ClaimCodeButton sx={{ marginTop: '10px' }}>
              Create a Hub
            </ClaimCodeButton>
          </Link>
          <Link href="/upload">
            <ClaimCodeButton sx={{ marginTop: '10px' }}>
              Publish a Track
            </ClaimCodeButton>
          </Link>
        </Box>
      ),
    },
  ]

  const signUpSteps = [
    {
      title: 'Create Account',
      content: `To get started, please sign up below.`,
      cta: (
        <>
          <WalletConnectModal inOnboardingFlow={true}>
            Create an Account
          </WalletConnectModal>
        </>
      ),
    },
    {
      title: 'Verify your Account (optional)',
      content: `        Now that you have set up your account, you can
            verify it via your Soundcloud or Twitter profile.`,
      cta: (
        <>
          <IdentityVerification
            verifications={profileVerifications}
            profilePubkey={profilePubkey}
            inOnboardingFlow={true}
          />
          <Box />
          <ClaimCodeButton
            onClick={() => setActiveStep(2)}
            sx={{ marginTop: '10px' }}
          >
            Do this Later
          </ClaimCodeButton>
        </>
      ),
    },
    {
      title: `Success`,
      content: `You're all set. You can now start uploading your music to Nina.`,
      cta: (
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }}
          >
            <Link href="/dashboard">
              <ClaimCodeButton sx={{ marginTop: '10px' }} >
                Go to Dashboard
              </ClaimCodeButton>
            </Link>

            <HtmlTooltip
              placement="top"
              title={
                solBalance > 0 ? null : (
                  renderToolTop('create a Hub', '/learn')
                )
              }
            >
              <Box width={'100%'}>
                <Link href="/hubs/create">
                  <ClaimCodeButton sx={{marginTop: '10px'}} disabled={solBalance === 0} >
                    Create a Hub 
                  </ClaimCodeButton>
                </Link>
              </Box>
            </HtmlTooltip>

    
            <HtmlTooltip
              placement="top"
              title={
                solBalance > 0 ? null : (
                renderToolTop('publish a Track', '/learn')
                )
              }
            >
              <Box width={'100%'}>
                <Link href="/upload">
                  <ClaimCodeButton sx={{marginTop: '10px'}} disabled={solBalance === 0} >
                    Publish a Track
                  </ClaimCodeButton>
                </Link>
              </Box>
            </HtmlTooltip>

            
          </Box>
        </>
      ),
    },
  ]

  const handleClaimCode = async (code) => {
    const message = new TextEncoder().encode(wallet.publicKey.toBase58())
    const messageBase64 = encodeBase64(message)
    const signature = await wallet.signMessage(message)
    const signatureBase64 = encodeBase64(signature)

    try {
      const response = await axios.post(
        `${process.env.NINA_IDENTITY_ENDPOINT}/onboardingCodes/${code}`,
        {
          message: messageBase64,
          signature: signatureBase64,
          publicKey: wallet.publicKey.toBase58(),
        }
      )
      if (response.data.status === 'success') {
        enqueueSnackbar('Code has been successfully redeemed', {
          info: 'success',
          variant: 'success',
        })
        setClaimedError(false)
        setClaimedCodeSuccess(true)
      }
      return
    } catch (error) {
      enqueueSnackbar('Code has already been redeemed or is invalid', {
        variant: 'error',
      })
      console.error(error)
      setClaimedError(true)
    }
  }

  const refreshBundlr = () => {
    getBundlrBalance()
    getBundlrPricePerMb()
    getSolPrice()
  }

  const OnboardSteps = (steps) => {
    return (
      <Box sx={{ width: '75%' }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => {
            return (
              <Step key={index}>
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
              </Step>
            )
          })}
        </Stepper>
      </Box>
    )
  }

  return (
    <ScrollablePageWrapper>
      <StyledGrid>
        <GetStartedPageWrapper>
          <>
            <Box mb={2}>
              <Typography variant="h1" mb={1}>
                Welcome to Nina.
              </Typography>
              {code !== undefined && (
                <>
                  <Typography variant="h3" mb={1}>
                    You are receiving complimentary SOL to create your Hub and
                    start uploading your music. Please follow the steps below to
                    get started.
                  </Typography>
                  {OnboardSteps(onboardingSteps)}
                </>
              )}

              {code === undefined && (
                <>
                  <Typography variant="h3" mb={1}>
                    Follow the steps below to get started.
                  </Typography>
                  {OnboardSteps(signUpSteps)}
                </>
              )}
            </Box>
          </>
        </GetStartedPageWrapper>
      </StyledGrid>
    </ScrollablePageWrapper>
  )
}

const StyledGrid = styled(Grid)(({ theme }) => ({
  paddingTop: '20px',
  maxHeight: '90vh',
  justifyContent: 'center',
  alignItems: 'center',
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

const ClaimCodeButton = styled(Button)(({ theme }) => ({
  border: `1px solid ${theme.palette.black}`,
  borderRadius: '0px',
  padding: '16px 20px',
  color: theme.palette.black,
  fontSize: '12px',
  width: '100%'
}))

const HtmlTooltip = styled(({className, ...props}) => (
  <Tooltip {...props} classes={{popper: className}} />
))(({theme}) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: '100%',
    // fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
  'a':{
    color: theme.palette.blue,
    fontSize: '18px'
  }
}));

export default Onboard
