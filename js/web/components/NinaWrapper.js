import React from 'react'
import Audio from '@nina-protocol/nina-sdk/esm/Audio'
import Exchange from '@nina-protocol/nina-sdk/esm/Exchange'
import Hub from '@nina-protocol/nina-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-sdk/esm/Nina'
import Release from '@nina-protocol/nina-sdk/esm/Release'
import NinaClient from "@nina-protocol/nina-sdk/esm/client"

import { AnchorProvider } from '@project-serum/anchor'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'

const NinaWrapper = ({ children, network }) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'processed',
  })

  const ninaClient = NinaClient(provider, network)
  return (
    <Nina.Provider ninaClient={ninaClient}>
      <Release.Provider>
        <Audio.Provider>
          <Exchange.Provider>
            <Hub.Provider>{children}</Hub.Provider>
          </Exchange.Provider>
        </Audio.Provider>
      </Release.Provider>
    </Nina.Provider>
  )
}

export default NinaWrapper
