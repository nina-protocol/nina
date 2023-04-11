import React, { useState, useEffect, useContext } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { encodeBase64 } from 'tweetnacl-util'
import axios from 'axios'
import Typography from '@mui/material/Typography'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import onboardingCodeWhitelist from '@nina-protocol/nina-internal-sdk/src/utils/onboardingCodeWhitelist'
import { useSnackbar } from 'notistack'
const Admin = () => {
  const wallet = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const walletPubkey = wallet.publicKey?.toBase58()
  const hasAccess = onboardingCodeWhitelist.includes(walletPubkey)
  const [code, setCode] = useState()
  const [restrictedRelease, setRestrictedRelease] = useState()
  const [restrictedAccount, setRestrictedAccount] = useState()
  const { getSolBalanceForPublicKey } = useContext(Nina.Context)
  const [verificationBalance, setVerificationBalance] = useState(0)
  const [dispatcherBalance, setDispatcherBalance] = useState(0)

  useEffect(() => {
    fetchWalletBalance(
      'idHukURpSwMbvcRER9pN97tBSsH4pdLSUhnHYwHftd5',
      setVerificationBalance
    )
    fetchWalletBalance(
      'BnhxwsrY5aaeMehsTRoJzX2X4w5sKMhMfBs2MCKUqMC',
      setDispatcherBalance
    )
  }, [verificationBalance, dispatcherBalance])

  const fetchWalletBalance = async (publicKey, setBalance) => {
    await getSolBalanceForPublicKey(publicKey).then((balance) => {
      setBalance(balance)
    })
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
      setCode(
        `https://ninaprotocol.com/getStarted?code=${response.data.onboardingCode.code}/`
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
            <Typography variant="h4" mb={2}>
              {verificationBalance > 0
                ? `Verification Wallet Balance: ${verificationBalance} SOL`
                : 'Verification Wallet Balance: 0 SOL'}
            </Typography>
            <Typography variant="h4" mb={4}>
              {dispatcherBalance > 0
                ? `Dispatcher Wallet Balance: ${dispatcherBalance} SOL`
                : 'Dispatcher Wallet Balance: 0 SOL'}
            </Typography>
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
            sx={{ width: '25vw' }}
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
            sx={{ width: '25vw' }}
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
