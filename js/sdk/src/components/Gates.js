import React, { useState, useEffect, useContext, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { encodeBase64 } from 'tweetnacl-util'
import axios from 'axios'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import LockIcon from '@mui/icons-material/Lock'
import CloseIcon from '@mui/icons-material/Close'
import GateCreateModal from './GateCreateModal'
import GateManageModal from './GateManageModal'
import Release from '../contexts/Release'
// import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'



import { useWallet } from '@solana/wallet-adapter-react'
import Dots from './Dots'

const Gates = ({ release, gate, isAuthority, releasePubkey, amountHeld, metadata }) => {
  const wallet = useWallet()
  const {fetchGatesForRelease} = useContext(Release.Context)
  const [gates, setGates] = useState(undefined)

  useEffect(() => {
    handleFetchGates(releasePubkey)
  }, [releasePubkey])

    const handleFetchGates = async () => {
    const gates = await fetchGatesForRelease(releasePubkey)
    if (gates.length > 0) {
      setGates(gates)
    }
  }

  return (
    <Root>
      {/* {gates && (
        <GateUnlockModal
          gates={gates}
          releasePubkey={releasePubkey}
          amountHeld={amountHeld}
        />
      )} */}

      {!gates && isAuthority && (
        <>
          <GateCreateModal
            releasePubkey={releasePubkey}
            handleFetchGates={handleFetchGates}
            metadata={metadata}
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
          />
        </>
      )}

    </Root>
  )
}

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}))


export default Gates
