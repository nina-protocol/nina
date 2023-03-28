import React, { useEffect, useState, useContext } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'
import { encodeBase64 } from 'tweetnacl-util'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Box from '@mui/system/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from 'next/link'
import {
  WalletDialogButton,
  useWalletDialog,
} from '@solana/wallet-adapter-material-ui'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import dynamic from 'next/dynamic'
const EmailCapture = dynamic(
  () => import('@nina-protocol/nina-internal-sdk/esm/EmailCapture'),
  { ssr: false }
)
const Onboard = (query) => {
  const onboardingCodeString = query?.code?.toString()
  const [code, setCode] = useState(onboardingCodeString)
  const [invalidCode, setInvalidCode] = useState(false)
  const wallet = useWallet()
  const [claimedStatus, setClaimedStatus] = useState(false)
  const [claimedCodeSuccess, setClaimedCodeSuccess] = useState(false)
  const [headerCopy, setHeaderCopy] = useState(
    'Your wallet is not connected, please connect your wallet to continue.'
  )
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    console.log('query.code', query.code)
    console.log('code', code)
    if (code) {
      fetchClaimCode(code)
    }
  }, [])

  useEffect(() => {
    if (wallet.connected) {
      setHeaderCopy(
        'Welcome to Nina. Nina is an independent music ecosystem that offers artists new models for releasing music. Click below to claim your onboarding code.'
      )
    }
  }, [wallet.connected])

  useEffect(() => {
    if (wallet.connected && claimedCodeSuccess) {
      setHeaderCopy(
        'Code has been redeemed. You know have access to the Nina ecosystem. For next steps, we recommend you create a Hub and start releasing music.'
      )
    }
  }, [wallet.connected, claimedCodeSuccess])

  const fetchClaimCode = async (code) => {
    try {
      const response = await axios.get(
        `${process.env.NINA_IDENTITY_ENDPOINT}/onboardingCodes/${code}`
      )
      if (response.data) {
        console.log('valid code')
      }
      return
    } catch {
      console.log('invalid code')
      setCode(undefined)
      setInvalidCode(true)
    }
  }

  const handleGenerateCode = async () => {
    const message = new TextEncoder().encode(wallet.publicKey.toBase58())
    const messageBase64 = encodeBase64(message)
    const signature = await wallet.signMessage(message)
    const signatureBase64 = encodeBase64(signature)

    const response = await axios.post(
      `${process.env.NINA_IDENTITY_ENDPOINT}/onboardingCodes`,
      {
        message: messageBase64,
        signature: signatureBase64,
        publicKey: wallet.publicKey.toBase58(),
      }
    )

    if (response.data) {
      setCode(response.data.onboardingCode.code)
    }
  }

  const handleClaimCode = async (code) => {
    const message = new TextEncoder().encode(wallet.publicKey.toBase58())
    const messageBase64 = encodeBase64(message)
    const signature = await wallet.signMessage(message)
    const signatureBase64 = encodeBase64(signature)

    const response = await axios.post(
      `${process.env.NINA_IDENTITY_ENDPOINT}/onboardingCodes/${code}`,
      {
        message: messageBase64,
        signature: signatureBase64,
        publicKey: wallet.publicKey.toBase58(),
      }
    )

    if (response.data.success) {
      enqueueSnackbar('Code has been redeemed', { info: 'success' })
      setClaimedStatus(true)
      setClaimedCodeSuccess(true)
    }
  }

  // const handleConnectWallet = async () => {
  //   wallet.connect()
  // }

  return (
    <ScrollablePageWrapper>
      <StyledGrid>
        <GetStartedPageWrapper>
          {/* if code is valid or not then intro to nina */}
          {code ? (
            <Box mb={2}>
              <Typography variant="h1" mb={1}>
                {headerCopy}
              </Typography>
            </Box>
          ) : (
            <Box mb={2}>
              <Typography variant="h1" mb={1}>
                Welcome to Nina. You need an onboarding code to continue.
              </Typography>
              <Typography variant="h3" mb={1}>
                If you feel as though you should have an onboarding code, please
                contact us at{' '}
                <a href="mailto:contact@ninaprotocol.com">
                  contact@ninaprotocol.com
                </a>
              </Typography>
              <EmailCapture size="getStarted" />
            </Box>
          )}

          {/* if no wallet but code is valid  */}
          {!wallet.connected && code && (
            <>
              <Box>
                <WalletDialogButton variant="contained" type={'button'}>
                  Connect Wallet
                </WalletDialogButton>

                <Typography variant="h3" mb={1}>
                  or
                </Typography>
                <Link href="https://phantom.app">
                  <a target="_blank">
                    <Typography variant="h3">Create a wallet</Typography>
                  </a>
                </Link>
              </Box>
            </>
          )}
          {/* if wallet is connected, code is valid and not claimed */}
          {wallet.connected && code && !claimedCodeSuccess && (
            <>
              <ClaimCodeButton onClick={() => handleClaimCode(code)}>
                Claim Code
              </ClaimCodeButton>
            </>
          )}
          {/* if wallet is connected, code is valid and claimed */}
          {wallet.connected && code && claimedCodeSuccess && (
            <>
              <Button
                fullWidth
                variant="outlined"
                sx={{ height: '54px', mt: 1, '&:hover': { opacity: '50%' } }}
              >
                <Link href="/hubs/create" passHref>
                  <a>
                    <Typography variant="body2" align="left">
                      Create a Hub
                    </Typography>
                  </a>
                </Link>
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ height: '54px', mt: 1, '&:hover': { opacity: '50%' } }}
              >
                <Link href="/hubs/create" passHref>
                  <a>
                    <Typography variant="body2" align="left">
                      Create a Hub
                    </Typography>
                  </a>
                </Link>
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ height: '54px', mt: 1, '&:hover': { opacity: '50%' } }}
              >
                <Link href="/hubs/create" passHref>
                  <a>
                    <Typography variant="body2" align="left">
                      Create a Hub
                    </Typography>
                  </a>
                </Link>
              </Button>
              <Box>
                <Typography variant="h3" mt={2}>
                  If you have any questions,{' '}
                  <a
                    href="mailto:contact@ninaprotocol.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    get in touch
                  </a>{' '}
                  or{' '}
                  <Link href="/learn" passHref>
                    <a>click here to learn more about Nina.</a>
                  </Link>
                </Typography>
              </Box>
            </>
          )}
          {/* 
          <button onClick={() => handleGenerateCode()}>Generate Code</button>
          <label for="code">OnboardingCode</label>
          <input
            type="text"
            id="code"
            name="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          
          <button onClick={() => handleClaimCode(code)}>Claim</button> */}

          {/* if code has already been claimed */}
          {wallet.connected && claimedStatus && (
            <Typography mt={1} mb={1}>
              This code has already been claimed. If you believe this is an
              error, please contact us at{' '}
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

          {/* if code is invalid */}
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
      opacity: '85%',
    },
  },
}))

const GetStartedPageWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: '100px auto ',
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
  border: `1px solid ${theme.palette.blue}`,
  borderRadius: '0px',
  padding: '16px 20px',
  color: theme.palette.blue,
}))

export default Onboard
