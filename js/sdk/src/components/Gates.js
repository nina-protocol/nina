import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import { encodeBase64 } from 'tweetnacl-util'
import axios from 'axios'
import Release from '../contexts/Release'
import { useSnackbar } from 'notistack'
import GateCreateModal from './GateCreateModal'
import GateUnlockModal from './GateUnlockModal'
import GateManageModal from './GateManageModal'

import { useWallet } from '@solana/wallet-adapter-react'

const Gates = ({ isAuthority, releasePubkey, amountHeld, metadata }) => {
  const wallet = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  const { fetchGatesForRelease } = useContext(Release.Context)
  const [gates, setGates] = useState(undefined)

  useEffect(() => {
    handleFetchGates(releasePubkey)
  }, [releasePubkey])

  const handleFetchGates = async () => {
    const gates = await fetchGatesForRelease(releasePubkey)
    if (gates.length > 0) {
      setGates(gates)
    } else {
      setGates(undefined)
    }
  }

  const unlockGate = async (gate) => {
    const releasePubkey = gate.releasePublicKey

    try {
      const message = new TextEncoder().encode(releasePubkey)
      const messageBase64 = encodeBase64(message)
      const signature = await wallet.signMessage(message)
      const signatureBase64 = encodeBase64(signature)
      const result = await axios.get(
        `${process.env.NINA_GATE_URL}/gate/${
          gate.id
        }?message=${encodeURIComponent(
          messageBase64
        )}&publicKey=${encodeURIComponent(
          wallet.publicKey.toBase58()
        )}&signature=${encodeURIComponent(signatureBase64)}`
      )

      const response = await axios.get(result.data.url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        responseType: 'blob',
      })

      if (response?.data) {
        const a = document.createElement('a')
        const url = window.URL.createObjectURL(response.data)
        a.href = url
        a.download = gate.fileName
        a.click()
        enqueueSnackbar(`${gate.fileName} Downloaded`, {
          variant: 'info',
        })
      }
    } catch (error) {
      console.warn('error: ', error)
      enqueueSnackbar(`Error Accessing File`, {
        variant: 'failure',
      })
    }
  }

  return (
    <Root>
      {gates && (
        <>
          <GateUnlockModal
            gates={gates}
            releasePubkey={releasePubkey}
            amountHeld={amountHeld}
            unlockGate={unlockGate}
          />
        </>
      )}
      {!gates && isAuthority && (
        <>
          <GateCreateModal
            releasePubkey={releasePubkey}
            handleFetchGates={handleFetchGates}
            metadata={metadata}
            gates={gates}
          />
        </>
      )}

      {gates && isAuthority && (
        <>
          <GateManageModal
            gates={gates}
            releasePubkey={releasePubkey}
            handleFetchGates={handleFetchGates}
            metadata={metadata}
            unlockGate={unlockGate}
          />
        </>
      )}
    </Root>
  )
}

const Root = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
}))

export default Gates
