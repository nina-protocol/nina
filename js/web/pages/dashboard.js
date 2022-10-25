import React, { useEffect, useState } from 'react'
import Dashboard from '../components/Dashboard'
import Head from 'next/head'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/router'

export default function DashboardPage() {
  const [publicKey, setPublicKey] = useState()
  const wallet = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!wallet.connected) {
      router.push('/')
    }
    if (wallet.connected) {
      setPublicKey(wallet.publicKey.toBase58())
    }
  }, [wallet])
  return (
    <>
      <Head>
        <title>Nina Protocol</title>
        <meta
          name="description"
          content={'Nina Protocol is a digitally native music ecosystem'}
        />
        <meta name="og:type" content="website" />
        <meta name="og:title" content="Nina Protocol" />
        <meta
          name="og:description"
          content={'Nina Protocol is a digitally native music ecosystem'}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/png" />
        <meta name="twitter:title" content="Nina Protocol" />
        <meta
          name="twitter:description"
          content={'Nina Protocol is a digitally native music ecosystem'}
        />

        <meta
          name="twitter:image"
          content="https://ninaprotocol.com/images/nina-blue.png"
        />
        <meta
          name="og:image"
          href="https://ninaprotocol.com/images/nina-blue.png"
        />
      </Head>
      {publicKey && <Dashboard publicKey={publicKey} />}
    </>
  )
}