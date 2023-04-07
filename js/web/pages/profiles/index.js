import React, { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'

export default function Profiles() {
  const { wallet } = useContext(Wallet.Context)
  const router = useRouter()

  useEffect(() => {
    let path
    if (wallet.connected) {
      path = '/dashboard'
    } else {
      path = '/'
    }
    router.push(path)
  }, [wallet])
  return <></>
}
