import React, { useContext } from 'react'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
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
          <Hub.Provider>{children}</Hub.Provider>
        </Audio.Provider>
      </Release.Provider>
    </Nina.Provider>
  )
}

export default NinaWrapper
