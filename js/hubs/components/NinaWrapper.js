import React, { useContext } from 'react'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import NinaClient from '@nina-protocol/nina-internal-sdk/esm/client'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import { AnchorProvider } from '@coral-xyz/anchor'

const NinaWrapper = ({ children, network }) => {
  const { wallet, connection } = useContext(Wallet.Context)
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'processed',
  })

  const ninaClient = NinaClient(provider, network)
  return (
    <Nina.Provider ninaClient={ninaClient}>
      <Release.Provider>
        <Audio.Provider>
          <Hub.Provider>{children}</Hub.Provider>
        </Audio.Provider>
      </Release.Provider>
    </Nina.Provider>
  )
}

export default NinaWrapper
