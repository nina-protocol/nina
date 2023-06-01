import React, { useState, useEffect, useContext } from 'react'
import { encodeBase64 } from 'tweetnacl-util'
import axios from 'axios'
import Typography from '@mui/material/Typography'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import Box from '@mui/material/Box'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import onboardingCodeWhitelist from '@nina-protocol/nina-internal-sdk/src/utils/onboardingCodeWhitelist'
import { useSnackbar } from 'notistack'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'

const ONBOARDING_ACCOUNT = 'B9TUbCJV5mpmgBzuqNBpsAnSTqzXZ4S6FxpPtcFPMps3'
const ID_ACCOUNT = 'idHukURpSwMbvcRER9pN97tBSsH4pdLSUhnHYwHftd5'
const DISPATCHER_ACCOUNT = 'BnhxwsrY5aaeMehsTRoJzX2X4w5sKMhMfBs2MCKUqMC'

const Admin = () => {
  const { wallet } = useContext(Wallet.Context)
  const { enqueueSnackbar } = useSnackbar()
  const walletPubkey = wallet.publicKey?.toBase58()
  const hasAccess = onboardingCodeWhitelist.includes(walletPubkey)
  const [code, setCode] = useState()
  const [restrictedRelease, setRestrictedRelease] = useState()
  const [restrictedAccount, setRestrictedAccount] = useState()
  const { getSolBalanceForPublicKey, ninaClient } = useContext(Nina.Context)
  const [verificationBalance, setVerificationBalance] = useState(0)
  const [dispatcherBalance, setDispatcherBalance] = useState(0)
  const [onboardingBalance, setOnboardingBalance] = useState(0)

  const [bulkCode, setBulkCode] = useState()
  const [bulkCodeCreatedFor, setBulkCodeCreatedFor] = useState()
  const [bulkCodeUses, setBulkCodeUses] = useState(50)
  const [bulkCodeDescription, setBulkCodeDescription] = useState()

  useEffect(() => {
    const fetchBalances = async () => {
      setVerificationBalance(await getSolBalanceForPublicKey(ID_ACCOUNT))
      setDispatcherBalance(await getSolBalanceForPublicKey(DISPATCHER_ACCOUNT))
      setOnboardingBalance(await getSolBalanceForPublicKey(ONBOARDING_ACCOUNT))
    }
    fetchBalances()
  }, [])

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
      setCode(
        `https://ninaprotocol.com/start?claim=${response.data.onboardingCode.code}/`
      )
    }
  }

  const handleGenerateBulkCode = async () => {
    const message = new TextEncoder().encode(wallet.publicKey.toBase58())

    const messageBase64 = encodeBase64(message)
    const signature = await wallet.signMessage(message)
    const signatureBase64 = encodeBase64(signature)

    const response = await axios.post(
      `${process.env.NINA_IDENTITY_ENDPOINT}/bulkOnboardingCodes`,
      {
        message: messageBase64,
        signature: signatureBase64,
        publicKey: wallet.publicKey.toBase58(),
        uses: bulkCodeUses,
        description: bulkCodeDescription,
        createdFor: bulkCodeCreatedFor,
        value: bulkCode,
      }
    )

    if (response.data) {
      enqueueSnackbar(`Successfully generated bulk code: ${bulkCode}`, {
        variant: 'success',
      })
    }
  }

  const handleBulkCodeClaim = async () => {
    const message = new TextEncoder().encode(wallet.publicKey.toBase58())

    const messageBase64 = encodeBase64(message)
    const signature = await wallet.signMessage(message)
    const signatureBase64 = encodeBase64(signature)

    const response = await axios.post(
      `${process.env.NINA_IDENTITY_ENDPOINT}/bulkOnboardingCodes/${bulkCode}`,
      {
        message: messageBase64,
        signature: signatureBase64,
        publicKey: wallet.publicKey.toBase58(),
      }
    ).catch((error) => {
      console.warn(error)
      if (error.response) {
        console.warn(error.response.data)
        console.warn(error.response.status)
        console.warn(error.response.headers)
        enqueueSnackbar(`Failed to claim code: ${bulkCode}. ${error.response.data.error}`, {
          variant: 'error',
        })
      }
    })
    if (response?.data?.status === 'success') {
      enqueueSnackbar(`Successfully claimed code: ${bulkCode}`, {
        variant: 'success',
      })
    }
  }



  // placeholder for restricted handler
  const handleRestricted = async (value, type) => {
    const message = new TextEncoder().encode(wallet.publicKey.toBase58())

    const messageBase64 = encodeBase64(message)
    const signature = await wallet.signMessage(message)
    const signatureBase64 = encodeBase64(signature)

    const response = await axios.post(
      `${process.env.NINA_IDENTITY_ENDPOINT}/restricted`,
      {
        message: messageBase64,
        signature: signatureBase64,
        publicKey: wallet.publicKey.toBase58(),
        value,
        type,
      }
    )

    if (response.data.status === 'success') {
      enqueueSnackbar(`Successfully restricted ${type}`, {
        variant: 'success',
      })
    } else {
      enqueueSnackbar(`Failed to restrict ${type}`, {
        variant: 'error',
      })
    }
  }

  return (
    <ScrollablePageWrapper>
      {hasAccess && (
        <Box>
          <Box>
            <a
              href={`https://explorer.solana.com/address/${ONBOARDING_ACCOUNT}?cluster=${process.env.SOLANA_CLUSTER}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Typography variant="h4" mb={2}>
                {`Onboarding Account Balance: ${ninaClient.nativeToUiString(
                  onboardingBalance,
                  ninaClient.ids.mints.wsol
                )}`}
              </Typography>
            </a>
            <a
              href={`https://explorer.solana.com/address/${ID_ACCOUNT}?cluster=${process.env.SOLANA_CLUSTER}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Typography variant="h4" mb={2}>
                {`Verification Account Balance: ${ninaClient.nativeToUiString(
                  verificationBalance,
                  ninaClient.ids.mints.wsol
                )}`}
              </Typography>
            </a>
            <a
              href={`https://explorer.solana.com/address/${DISPATCHER_ACCOUNT}?cluster=${process.env.SOLANA_CLUSTER}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Typography variant="h4" mb={4}>
                {`Dispatcher Account Balance: ${ninaClient.nativeToUiString(
                  dispatcherBalance,
                  ninaClient.ids.mints.wsol
                )}`}
              </Typography>
            </a>
          </Box>
          <Box>
            <Input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              sx={{ width: '40vw' }}
            />
            <Button variant="outlined" onClick={() => handleGenerateCode()}>
              Click Here to Generate an Onboarding Code
            </Button>
          </Box>

          <Box mt={1}>
            <Input
              type="text"
              id="code"
              name="code"
              value={restrictedRelease}
              onChange={(event) => setRestrictedRelease(event.target.value)}
              sx={{ width: '40vw' }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                handleRestricted(restrictedRelease, 'release')
              }}
            >
              Restrict Release
            </Button>
          </Box>
          <Box mt={1}>
            <Input
              type="text"
              id="code"
              name="code"
              value={restrictedAccount}
              onChange={(event) => setRestrictedAccount(event.target.value)}
              sx={{ width: '40vw' }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                handleRestricted(restrictedAccount, 'account')
              }}
            >
              Restrict Account
            </Button>
          </Box>
          <Box mb={2}>
            <h2>
              <b>Bulk Code Generator</b>
            </h2>
            <Box>
              <label for="bulkCode">Bulk Code</label>
              <Input
                type="text"
                id="bulkCode"
                name="bulkCode"
                value={bulkCode}
                onChange={(event) => setBulkCode(event.target.value)}
                sx={{ margin: '0 8px', width: '40vw' }}
              />
            </Box>
            <Box>
              <label for="bulkCodeCreatedFor">Bulk Code Created For</label>
              <Input
                type="text"
                id="bulkCodeCreatedFor"
                name="bulkCodeCreatedFor"
                value={bulkCodeCreatedFor}
                onChange={(event) => setBulkCodeCreatedFor(event.target.value)}
                sx={{ margin: '0 8px', width: '40vw' }}
              />
            </Box>
            <Box>
              <label for="bulkCodeDescription">Bulk Code Description</label>
              <Input
                type="text"
                id="bulkCodeDescription"
                name="bulkCodeDescription"
                value={bulkCodeDescription}
                onChange={(event) => setBulkCodeDescription(event.target.value)}
                sx={{ margin: '0 8px', width: '40vw' }}
              />
            </Box>
            <Box>
              <label for="bulkCodeUses">Bulk Code Uses</label>
              <Input
                type="number"
                id="bulkCodeUses"
                name="bulkCodeUses"
                value={bulkCodeUses}
                onChange={(event) => setBulkCodeUses(event.target.value)}
                sx={{ margin: '0 8px', width: '40vw' }}
              />
            </Box>
            <Button variant="outlined" onClick={() => handleGenerateBulkCode()}>
              Generate Bulk Onboarding Code
            </Button>
            <Button variant='outlined' onClick={() => handleBulkCodeClaim()}>
              Test Bulk Code Claim
            </Button>
          </Box>
        </Box>
      )}
    </ScrollablePageWrapper>
  )
}

export default Admin
