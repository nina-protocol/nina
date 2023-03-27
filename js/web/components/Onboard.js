import React, { useEffect, useState, useContext } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'
import { encodeBase64 } from 'tweetnacl-util'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import {styled} from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import  Box  from '@mui/system/Box'
import Typography from '@mui/material/Typography'
import Button  from '@mui/material/Button'
import Link from 'next/link'
import {WalletDialogButton, useWalletDialog} from '@solana/wallet-adapter-material-ui'
const Onboard = () => {
  const [code, setCode] = useState()
  const wallet = useWallet()
  const [claimedStatus, setClaimedStatus] = useState(false)
  const [headerCopy, setHeaderCopy] = useState('Your wallet is not connected, please connect your wallet to continue.')

  useEffect(() => {
    if (wallet.connected) {
      setHeaderCopy('Click below to claim your onboarding code.')
    }
  }, [wallet.connected])

  const handleGenerateCode = async () => {
    const message = new TextEncoder().encode(wallet.publicKey.toBase58())
    const messageBase64 = encodeBase64(message)
    const signature = await wallet.signMessage(message)
    const signatureBase64 = encodeBase64(signature)

    const response = await axios.post(`${process.env.NINA_IDENTITY_ENDPOINT}/onboardingCodes`, {
      message: messageBase64,
      signature: signatureBase64,
      publicKey: wallet.publicKey.toBase58(),
    })

    if (response.data) {
      setCode(response.data.onboardingCode.code)
    }

  }
  
  const handleClaimCode = async (code) => {
    const message = new TextEncoder().encode(wallet.publicKey.toBase58())
    const messageBase64 = encodeBase64(message)
    const signature = await wallet.signMessage(message)
    const signatureBase64 = encodeBase64(signature)

    const response = await axios.post(`${process.env.NINA_IDENTITY_ENDPOINT}/onboardingCodes/${code}`, {
      message: messageBase64,
      signature: signatureBase64,
      publicKey: wallet.publicKey.toBase58(),
    })

    if (response.data.success) {
      console.log('success')
      setClaimedStatus(true)
    }
  }

  // const handleConnectWallet = async () => {
  //   wallet.connect()
  // }

  return (
    <ScrollablePageWrapper>
      <StyledGrid>
        <GetStartedPageWrapper>
          <Box mb={2}>
            <Typography variant="h2">
              {
                'Welcome to Nina. Nina is an independent music ecosystem that offers artists new models for releasing music.'
              }{' '}
              {headerCopy}
            </Typography>
          </Box>
          {!wallet.connected && (
            <>
              <Box>
                <WalletDialogButton
                  variant="contained"
                  type={'button'}
                
                >
                 Connect Wallet
                </WalletDialogButton>

                <Typography variant="h3" mb={1}>
                  or
                </Typography>
                <Link href="https://phantom.app">
                  <a target="_blank" rel="noreferrer">
                    <Typography variant="h3">Create a wallet</Typography>
                  </a>
                </Link>
              </Box>
            </>
          )}
          {/* <button onClick={() => handleGenerateCode()}>Generate Code</button>
          <label for="code">OnboardingCode</label>
          <input
            type="text"
            id="code"
            name="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <button onClick={() => handleClaimCode(code)}>Claim</button> */}
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

const FaqBox = styled(Box)(({ theme }) => ({
  width: '50%',
  marginTop: '15px',
  marginBottom: '15px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}))

const ExampleHeader = styled(Typography)(({ theme }) => ({
  marginTop: '30px',
  fontSize: '30px !important',
  [theme.breakpoints.down('md')]: {
    fontSize: '20px !important',
  },
}))

const ExampleBody = styled(Typography)(({ theme }) => ({
  marginTop: '15px',
  marginBottom: '15px',
  width: '50%',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}))

const ExampleContainer = styled(Box)(() => ({
  marginBottom: '30px',
}))

export default Onboard