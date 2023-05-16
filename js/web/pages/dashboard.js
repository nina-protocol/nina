import React, { useContext, useEffect, useState } from 'react'
import { Box } from '@mui/system'
import Head from 'next/head'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import { useRouter } from 'next/router'
import { styled } from '@mui/system'
import dynamic from 'next/dynamic'
const Dashboard = dynamic(() => import('../components/Dashboard'))

const DashboardPage = () => {
  const [publicKey, setPublicKey] = useState()
  const { wallet } = useContext(Wallet.Context)
  const router = useRouter()

  useEffect(() => {
    if (wallet?.publicKey) {
      setPublicKey(wallet?.publicKey?.toBase58())
    } else {
      router.push('/')
    }
  }, [wallet, publicKey])
  return (
    <>
      <Head>
        <title>Nina Protocol - Dashboard</title>
        <meta
          name="description"
          content={'Nina Protocol is an independent music ecosystem'}
        />
        <meta name="og:type" content="website" />
        <meta name="og:title" content="Nina Protocol" />
        <meta
          name="og:description"
          content={'Nina Protocol is an independent music ecosystem'}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/png" />
        <meta name="twitter:title" content="Nina Protocol" />
        <meta
          name="twitter:description"
          content={'Nina Protocol is an independent music ecosystem'}
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
      {publicKey && (
        <DashboardPageContainer>
          <Dashboard publicKey={publicKey} />
        </DashboardPageContainer>
      )}
    </>
  )
}
const DashboardPageContainer = styled(Box)(({ theme }) => ({
  width: theme.maxWidth,
  [theme.breakpoints.down('md')]: {
    minHeight: '40vh',
  },
}))
export default DashboardPage
