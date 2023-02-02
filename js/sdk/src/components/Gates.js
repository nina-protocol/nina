import React, { useContext, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import { encodeBase64 } from 'tweetnacl-util'
import axios from 'axios'
import Release from '../contexts/Release'
import { useSnackbar } from 'notistack'
import GateCreateModal from './GateCreateModal'
import GateUnlockModal from './GateUnlockModal'
import GateManageModal from './GateManageModal'

import { useWallet } from '@solana/wallet-adapter-react'

const Gates = ({
  isAuthority,
  releasePubkey,
  amountHeld,
  metadata,
  inSettings,
}) => {
  const wallet = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const { fetchGatesForRelease, gatesState } = useContext(Release.Context)
  const releaseGates = useMemo(
    () => gatesState[releasePubkey],
    [gatesState, releasePubkey]
  )
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
      {releaseGates && !inSettings && (
        <>
          <GateUnlockModal
            gates={releaseGates}
            releasePubkey={releasePubkey}
            amountHeld={amountHeld}
            unlockGate={unlockGate}
          />
        </>
      )}
      {!releaseGates && isAuthority && inSettings && (
        <>
          <GateCreateModal
            releasePubkey={releasePubkey}
            fetchGatesForRelease={fetchGatesForRelease}
            metadata={metadata}
            gates={releaseGates}
          />
        </>
      )}

      {releaseGates && isAuthority && inSettings && (
        <>
          <GateManageModal
            gates={releaseGates}
            releasePubkey={releasePubkey}
            fetchGatesForRelease={fetchGatesForRelease}
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
