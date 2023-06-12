import React, { useContext, useEffect } from 'react'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Exchange from '@nina-protocol/nina-internal-sdk/esm/Exchange'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import NinaSdk from '@nina-protocol/js-sdk'

import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'

const NinaWrapper = ({ children }) => {
  
  const { wallet, connection } = useContext(Wallet.Context)

  const refreshNinaSdkClient = async () => {
    await NinaSdk.client.init(
      process.env.NINA_API_ENDPOINT,
      process.env.SOLANA_CLUSTER_URL,
      process.env.NINA_PROGRAM_ID,
      process.env.NINA_API_KEY,
      wallet,
      connection
    )
  }

  useEffect(() => {
    refreshNinaSdkClient()
  }, [wallet, connection])

  return (
    <Nina.Provider>
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
