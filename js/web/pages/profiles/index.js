import React, {useEffect} from 'react'
import {useWallet} from '@solana/wallet-adapter-react'
import {useRouter} from 'next/router'

export default function Profiles() {
  const wallet = useWallet()
  const router = useRouter()

  useEffect(() => {
    let path;
    if (wallet.connected) {
       path = '/dashboard'
    } else {
      path ='/'
    }
      router.push(path)
  }, [wallet])
  return (
    <>
    </>
  )
}
