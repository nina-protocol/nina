import ReleaseCreate from '@nina-protocol/nina-internal-sdk/esm/ReleaseCreate'
import Head from 'next/head'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

const ReleaseCreatePage = () => {
  return (
    <>
      <Head>
        <title>Nina Protocol - Upload</title>
        <meta
          name="description"
          content={'Nina Protocol is an independent music ecosystem'}
        />
        <meta name="og:type" content="website" />
        <meta name="og:title" content="Nina Protocol - Upload" />
        <meta
          name="og:description"
          content={'Nina Protocol is an independent music ecosystem'}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/png" />
        <meta name="twitter:title" content="Nina Protocol - Upload" />
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
      <ReleaseCreate canAddContent={true} />
    </>
  )
}

export default ReleaseCreatePage
