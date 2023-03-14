import React, {useEffect, useState, useMemo} from 'react'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Exchange from '@nina-protocol/nina-internal-sdk/esm/Exchange'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import NinaClient from '@nina-protocol/nina-internal-sdk/esm/client'

import { AnchorProvider } from '@project-serum/anchor'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import {setLazyProp} from 'next/dist/server/api-utils'

const NinaWrapper = ({ children, network }) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const [hasSetInstanceId, setHasSetInstanceId] = useState(false)
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'processed',
  })

  const instanceId = useMemo(() => 'nina_instance_' + Math.floor(Math.random() * 100000), [])
  const ninaClient = NinaClient(provider, network, instanceId)

  if (typeof window !== 'undefined' && !hasSetInstanceId) {
    console.log('ninaClient.instanceId :>> ', ninaClient.instanceId)
    localStorage.setItem(ninaClient.instanceId, JSON.stringify({playing: false}))
    setHasSetInstanceId(true)
  }

  // console.log('ninaClient :>> ', ninaClient);
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
