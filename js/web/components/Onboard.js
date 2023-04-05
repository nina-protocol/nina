import React, { useEffect, useState, useContext } from 'react'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import axios from 'axios'
import { encodeBase64 } from 'tweetnacl-util'

const Onboard = () => {
  const [code, setCode] = useState()
  const { wallet } = useContext(Wallet.Context)
  const [claimedStatus, setClaimedStatus] = useState(false)

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
      setClaimedStatus(true)
    }
  }

  return (
    <div>
      <button onClick={() => handleGenerateCode()}>Generate Code</button>
      <label for="code">OnboardingCode</label>
      <input
        type="text"
        id="code"
        name="code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />
      <button onClick={() => handleClaimCode(code)}>Claim</button>
    </div>
  )
}

export default Onboard
