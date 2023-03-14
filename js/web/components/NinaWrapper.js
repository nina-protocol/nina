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
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'processed',
  })

  const instanceId = useMemo(() => 'nina_' + Math.floor(Math.random() * 100000), [])

  const ninaClient = NinaClient(provider, network, instanceId)
  // console.log('instanceId !!:>> ', instanceId);
  const handleNinaInstance = (instanceId) => {
    // console.log('instances :>> ', instances);
   let instances = localStorage.getItem('ninaInstanceTracker')
    // console.log('instanceId :>> ', instanceId);

   if (!instances) {
      localStorage.setItem('ninaInstanceTracker', JSON.stringify({
        [`${instanceId}`]: {playing: false}
      }))
   } else {
    instances = JSON.parse(localStorage.getItem('ninaInstanceTracker'))
    instances[`${instanceId}`] = {playing: false}
    localStorage.setItem('ninaInstanceTracker', JSON.stringify(instances))
   }
  //  console.log('instances :>> ', instances);
  }

  useEffect(() => {
    if (window !== undefined) {
      handleNinaInstance(ninaClient.instanceId)
    }
  }, [])




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
