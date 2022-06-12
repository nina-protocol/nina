import React from 'react'
import nina from '@nina-protocol/nina-sdk'
import { AnchorProvider } from '@project-serum/anchor'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'

const NinaWrapper = ({ children, network }) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const {
    ReleaseContextProvider,
    AudioPlayerContextProvider,
    NinaContextProvider,
    HubContextProvider,
    ExchangeContextProvider,
  } = nina.contexts
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'processed',
  })

  const ninaClient = nina.client(provider, network)
  return (
    <NinaContextProvider ninaClient={ninaClient}>
      <ReleaseContextProvider>
        <AudioPlayerContextProvider>
          <ExchangeContextProvider>
            <HubContextProvider>{children}</HubContextProvider>
          </ExchangeContextProvider>
        </AudioPlayerContextProvider>
      </ReleaseContextProvider>
    </NinaContextProvider>
  )
}

export default NinaWrapper
