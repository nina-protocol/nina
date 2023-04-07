import React, { useEffect, useState, useContext } from 'react'
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
import WalletConnectModal  from '@nina-protocol/nina-internal-sdk/esm/WalletConnectModal'

const Onboard = () => {
  const router = useRouter()

  const { query } = router
  const [code, setCode] = useState()
  const { wallet } = useContext(Wallet.Context)
  const [claimedError, setClaimedError] = useState(false)
  const [claimedCodeSuccess, setClaimedCodeSuccess] = useState(false)
  const [headerCopy, setHeaderCopy] = useState(
    'Your wallet is not connected, please connect your wallet to continue.'
  )
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (!router.isReady) return
    if (router.isReady && query.code) {
      const onboardingCodeString = query.code.toString()
      if (onboardingCodeString) {
        setCode(onboardingCodeString)
      }
    }
  }, [router.isReady])

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
        'Code has been redeemed. You now have access to the Nina ecosystem. For next steps, we recommend you create a Hub and start releasing music.'
      )
    }
  }, [wallet.connected, claimedCodeSuccess])

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
      if (response.data.success) {
        enqueueSnackbar('Code has been successfully redeemed', {
          info: 'success',
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

  return (
    <ScrollablePageWrapper>
      <StyledGrid>
        <GetStartedPageWrapper>
          <>
            <Box mb={2}>
              <Typography variant="h1" mb={1}>
                {headerCopy}
              </Typography>
              {!wallet.connected && (
                <>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{ display: 'flex', flexDirection: 'row' }}
                    >
                        <WalletConnectModal>
                          <BlueTypography variant="h3">
                            Connect your wallet
                          </BlueTypography>
                        </WalletConnectModal>
                      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        or
                        <Link href="https://phantom.app/download">
                          <a target="_blank">
                            <Typography variant="h3" sx={{ margin: '0px 8px' }}>
                              create a wallet
                            </Typography>
                          </a>
                        </Link>
                        to get started.
                      </Box>
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
            {wallet.connected && (
              <>
                {code !== undefined && (
                  <Typography
                    variant="h4"
                    mb={1}
                  >{`Onboarding code: ${code}`}</Typography>
                )}
                <ClaimCodeButton onClick={() => handleClaimCode(code)}>
                  Claim Code
                </ClaimCodeButton>
              </>
            )}
          </>

          {wallet.connected && claimedCodeSuccess && (
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
                      Start Exploring
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
          {wallet.connected && claimedError && (
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

const BlueTypography = styled(Typography)(({ theme }) => ({
  color: `${theme.palette.blue} !important`,
  marginRight: '8px',
  cursor: 'pointer',
  textTransform: 'none',
  '&:hover': {
    opacity: '85%',
  },
}))

export default Onboard
