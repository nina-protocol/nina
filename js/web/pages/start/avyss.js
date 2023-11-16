import React from 'react'
import Head from 'next/head'
import Onboard from '../../components/Onboard'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import { styled } from '@mui/material/styles'
import LocalizedStrings from 'react-localization'

const StartPage = () => {
  const welcomeString = new LocalizedStrings({
    en: {
      header: 'Follow the steps below to get started on Nina:',
    },
    ja: {
      header: '下の手順に沿って進んでください。',
    },
  })
  return (
    <>
      <Head>
        <title>Nina Protocol - Start</title>
        <meta
          name="description"
          content={'Nina Protocol is an independent music ecosystem'}
        />
        <meta name="og:type" content="website" />
        <meta name="og:title" content="Nina Protocol - Start" />
        <meta
          name="og:description"
          content={'Nina Protocol is an independent music ecosystem'}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/png" />
        <meta name="twitter:title" content="Nina Protocol - Start" />
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

      {/* <CustomHeader>
        <Typography mb={1} variant="h3">
          Welcome to Nina from Avyss
        </Typography>
        <Typography variant="body1">{welcomeString.header}</Typography>
      </CustomHeader> */}
      <Onboard customCode={'avyss'} />
    </>
  )
}

const CustomHeader = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: '0px auto',
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '1000px',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    width: '80%',
    margin: '25px auto',
    paddingBottom: '100px',
  },
}))

export default StartPage
