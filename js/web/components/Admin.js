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
import NinaSdk from '@nina-protocol/js-sdk'

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
  const { getSolBalanceForPublicKey } = useContext(Nina.Context)
  const [verificationBalance, setVerificationBalance] = useState(0)
  const [dispatcherBalance, setDispatcherBalance] = useState(0)
  const [onboardingBalance, setOnboardingBalance] = useState(0)
  const ids = NinaSdk.utils.NINA_CLIENT_IDS[process.env.SOLANA_CLUSTER]
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
                {`Onboarding Account Balance: ${NinaSdk.utils.nativeToUiString(
                  onboardingBalance,
                  ids.mints.wsol
                )}`}
              </Typography>
            </a>
            <a
              href={`https://explorer.solana.com/address/${ID_ACCOUNT}?cluster=${process.env.SOLANA_CLUSTER}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Typography variant="h4" mb={2}>
                {`Verification Account Balance: ${NinaSdk.utils.nativeToUiString(
                  verificationBalance,
                  ids.mints.wsol
                )}`}
              </Typography>
            </a>
            <a
              href={`https://explorer.solana.com/address/${DISPATCHER_ACCOUNT}?cluster=${process.env.SOLANA_CLUSTER}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Typography variant="h4" mb={4}>
                {`Dispatcher Account Balance: ${NinaSdk.utils.nativeToUiString(
                  dispatcherBalance,
                  ids.mints.wsol
                )}`}
              </Typography>
            </a>
          </Box>
          <Box mb={2}>
            <Button variant="outlined" onClick={() => handleGenerateCode()}>
              Click Here to Generate an Onboarding Code
            </Button>
          </Box>
          <Typography for="code" mb={1}>
            If generated successfully, onboarding Code should print below
          </Typography>

          <Input
            type="text"
            id="code"
            name="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            sx={{ width: '40vw' }}
          />

          <Typography for="code" mt={4} mb={1}>
            If you have a release that needs to be restricted, please enter its
            ID below.
          </Typography>
          <Input
            type="text"
            id="code"
            name="code"
            value={restrictedRelease}
            onChange={(event) => setRestrictedRelease(event.target.value)}
            sx={{ width: '40vw' }}
          />
          <Box mt={1}>
            <Button
              variant="outlined"
              onClick={() => {
                handleRestricted(restrictedRelease, 'release')
              }}
            >
              Restrict Release
            </Button>
          </Box>
          <Typography for="code" mt={4} mb={1}>
            If you have an account that needs to be restricted, please enter its
            ID below.
          </Typography>
          <Input
            type="text"
            id="code"
            name="code"
            value={restrictedAccount}
            onChange={(event) => setRestrictedAccount(event.target.value)}
            sx={{ width: '40vw' }}
          />
          <Box mt={1}>
            <Button
              variant="outlined"
              onClick={() => {
                handleRestricted(restrictedAccount, 'account')
              }}
            >
              Restrict Account
            </Button>
          </Box>
        </Box>
      )}
    </ScrollablePageWrapper>
  )
}

export default Admin
