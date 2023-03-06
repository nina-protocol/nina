import React, { useEffect } from 'react'
import Homepage from '../components/HomePage'
import Head from 'next/head'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/router'

export default function Home() {
  const wallet = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (wallet.connected && router?.query?.code) {
      router.push(`/dashboard?code=${router.query.code}`)
    }
  }, [wallet, router.query.code])
  return (
    <>
      <Head>
        <title>Nina Protocol</title>
        <meta
          name="description"
          content={
            'Listen, collect and discover with Nina, an independent music ecosystem.'
          }
        />
        <meta name="og:type" content="website" />
        <meta name="og:title" content="Nina Protocol" />
        <meta
          name="og:description"
          content={
            'Listen, collect and discover with Nina, an independent music ecosystem'
          }
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/png" />
        <meta name="twitter:title" content="Nina Protocol" />
        <meta
          name="twitter:description"
          content={
            'Listen, collect and discover with Nina, an independent music ecosystem'
          }
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
      <Homepage />
    </>
  )
}
