import React, { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/router'

export default function Profiles() {
  const wallet = useWallet()
  const router = useRouter()
  debugger

  useEffect(() => {
    let path
    if (wallet.connected) {
      path = '/dashboard'
    } else {
      path = '/'
    }
    router.push(path)
  }, [wallet, router])
  return <></>
}
