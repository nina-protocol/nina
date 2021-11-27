import React from 'react'
import { styled } from '@mui/material/styles'
import { Typography, Box } from '@mui/material'

import ScrollablePageWrapper from './ScrollablePageWrapper'

const FaqPage = () => {
  return (
    <ScrollablePageWrapper>
      <FaqPageContainer overflowX="visible">
        <Typography
          variant="h1"
          align="left"
          sx={{ padding: { md: '0 0 30px', xs: '30px 0px' } }}
        >
          FAQ
        </Typography>

        <FaqEntry>
          <Typography
            variant="h2"
            align="left"
            className={classes.sectionHeader}
          >
            What is Nina?
          </Typography>
          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          >
            {
              "Nina is a new infrastructure to buy, sell and stream music online. Nina is designed to solve inequity and opportunism in the music industry by providing a new model that doesn't syphon revenue from artists."
            }
          </Typography>
          <Typography variant="h4" align="left">
            After a one time fee, releases on Nina are permanent. This fee
            handles Solana and {`Arweave's`} transaction and storage cost
            (~$2.50 + $0.01/MB). Nina takes no additional fees to publish a
            release. (Currently, all transaction costs for artists are
            subsidized by Nina) The patronage model created between artist and
            fan serves as a platform agnostic mechanism to provide exclusive
            experiences to supporters.
          </Typography>
        </FaqEntry>

        <FaqEntry>
          <Typography
            variant="h2"
            align="left"
            className={classes.sectionHeader}
          >
            How does Nina work?
          </Typography>
          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          >
            When uploading releases to Nina, an artist chooses the edition size,
            price, and resale percentage of the release. The release will be
            publicly streamable and purchaseable via USDC - the artist receives
            100% of initial sales.
          </Typography>
          <Typography variant="h4" align="left">
            {`Releases can be sold on the secondary market at a price of the owner's
            choosing. The artist receives their chosen percent of secondary
            sales and the Nina protocol receives 1.5%, paid by the seller.`}
          </Typography>
        </FaqEntry>

        <FaqEntry>
          <Typography
            variant="h2"
            align="left"
            className={classes.sectionHeader}
          >
            How do I put my music on Nina?
          </Typography>
          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          ></Typography>

          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          >
            In order to ensure the smoothest possible experience, we are rolling
            out Nina in pieces. Currently, Nina Publishing Credits are required
            to access the upload page and can be requested{' '}
            <a
              rel="noreferrer"
              target="_blank"
              href="https://docs.google.com/forms/d/e/1FAIpQLSdj13RKQcw9GXv3A5U4ebJhzJjjfxzxuCtB092X4mkHm5XX0w/viewform"
            >
              here
            </a>
            .
          </Typography>
          <Typography variant="h4" align="left">
            Soon, we will make the upload page publicly available and continue
            shipping new features.
          </Typography>
        </FaqEntry>

        <FaqEntry>
          <Typography
            variant="h2"
            align="left"
            className={classes.sectionHeader}
          >
            How do I set up a wallet?
          </Typography>
          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          ></Typography>

          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          >
            Nina is built on{' '}
            <a rel="noreferrer" target="_blank" href="https://solana.com/">
              Solana
            </a>{' '}
            and requires a Solana wallet to make purchaes. We recommend using{' '}
            <a rel="noreferrer" target="_blank" href="https://phantom.app/">
              Phantom Wallet
            </a>
            .
          </Typography>
          <Typography variant="h4" align="left">
            If you need any help, hop into our{' '}
            <a
              rel="noreferrer"
              target="_blank"
              href="https://discord.gg/ePkqJqSBgj"
            >
              Discord.
            </a>
          </Typography>
        </FaqEntry>
        <FaqEntry>
          <Typography
            variant="h2"
            align="left"
            className={classes.sectionHeader}
          >
            I’m new to crypto. How do I buy something on Nina?
          </Typography>
          <Typography variant="h4" align="left">
            First you’ll need to set up a wallet (See above). In your Phantom
            wallet you can purchase SOL using a credit card by clicking on
            ‘Deposit’ and then ‘Buy with MoonPay’. You can also buy SOL on an
            exchange like{' '}
            <a target="_blank" href="www.ftx.us" rel="noreferrer">
              FTX
            </a>
            ,{' '}
            <a target="_blank" href="www.coinbase.com" rel="noreferrer">
              Coinbase
            </a>
            ,{' '}
            <a target="_blank" href="https://blockfolio.com/" rel="noreferrer">
              Blockfolio
            </a>
            , or{' '}
            <a target="_blank" href="https://www.binance.us/" rel="noreferrer">
              Binance
            </a>{' '}
            and send it to your Phantom wallet.
          </Typography>
          <br />
          <Typography variant="h4" align="left">
            Once you have some SOL you need to get some USDC. All releases on
            Nina are denominated in USDC which is a cryptocurrency pegged to the
            US dollar, so that 1 USDC always equals $1. You can swap some SOL
            for USDC by using the swap function in your Phantom wallet (the
            middle button). Make sure to keep some SOL in your wallet so that
            you can pay the network fees when buying releases or swapping
            between USDC and SOL.{' '}
          </Typography>
        </FaqEntry>
        <FaqEntry>
          <Typography
            variant="h2"
            align="left"
            className={classes.sectionHeader}
          >
            Do I have to buy a track to listen to it?
          </Typography>
          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          ></Typography>

          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          >
            No. All tracks on Nina are freely and permanently streamable by
            anyone.
          </Typography>
        </FaqEntry>

        <FaqEntry>
          <Typography
            variant="h2"
            align="left"
            className={classes.sectionHeader}
          >
            Does Nina have a mobile app?
          </Typography>
          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          ></Typography>

          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          >
            Not yet but we are working on it! In the meantime, you can listen to
            tracks on the Nina website on mobile.
          </Typography>
        </FaqEntry>

        <FaqEntry>
          <Typography
            variant="h2"
            align="left"
            className={classes.sectionHeader}
          >
            Is Nina open source?
          </Typography>
          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          ></Typography>

          <Typography
            variant="h4"
            align="left"
            sx={{ paddingBottom: { md: '10px', xs: '30px' } }}
          >
            Yes! You can view the Nina code
            <a
              rel="noreferrer"
              target="_blank"
              href="https://github.com/nina-market/nina"
            >
              {' '}
              here
            </a>
            . Nina is unaudited software and should be used at your own risk.
          </Typography>
        </FaqEntry>
        <FaqEntry>
          <Typography
            variant="h2"
            align="left"
            className={classes.sectionHeader}
          >
            What about the effect of cryptocurrencies and Nina on the
            environment?
          </Typography>
          <Typography variant="h4" align="left">
            Nina is built on Solana which is a proof-of-stake blockchain.
            Proof-of-stake blockchains run on standard servers and do not need
            to run resource + power intensive operations like proof-of-work
            blockchains. In fact, it has been posited that the cost of a
            transaction on Solana uses less energy than a single Google search.
          </Typography>
          <br />
          <Typography variant="h4" align="left">
            Solana has recently published their 2021{' '}
            <a
              href="https://solana.com/news/solana-energy-usage-report-november-2021"
              rel="noreferrer"
              target="_blank"
            >
              energy use report
            </a>
            .
          </Typography>
        </FaqEntry>

        <FaqEntry>
          <Typography
            variant="h2"
            align="left"
            className={classes.sectionHeader}
          >
            How do I withdraw my USDC?
          </Typography>
          <Typography variant="h4" align="left">
            On Nina, all releases are priced in USDC. The USDC used on Nina is
            SPL-wrapped USDC, native to the Solana blockchain. It is important
            to make sure that your exchange accepts SPL-USDC.{' '}
            <a target="_blank" href="www.ftx.us">
              FTX
            </a>{' '}
            and{' '}
            <a target="_blank" href="www.binance.us">
              Binance
            </a>{' '}
            both accept SPL-USDC (make sure to send to the SPL-USDC address
            given by your exchange - it should not start with {`"0x"`}).
          </Typography>
          <br />
          <Typography variant="h4" align="left">
            You cannot withdraw SPL-USDC to Coinbase, doing so will result in
            the loss of your funds. In order to withdraw to Coinbase, first
            convert your USDC to SOL using the swap functionality in Phantom,
            and then send the SOL to Coinbase.
          </Typography>
          <br />
          <Typography variant="h4" align="left">
            We understand that interacting with exchanges can be confusing at
            first and we are here to help. Don’t hesitate to get in touch if you
            have any questions.
          </Typography>
        </FaqEntry>
      </FaqPageContainer>
    </ScrollablePageWrapper>
  )
}

const PREFIX = 'faqPage'

const classes = {
  sectionHeader: `${PREFIX}-sectionHeader`,
}

const FaqPageContainer = styled('div')(({ theme }) => ({
  width: '1010px',
  margin: 'auto',
  overflowX: 'visible',
  [theme.breakpoints.down('md')]: {
    width: '80vw',
    marginBottom: '100px',
  },
  [`& .${classes.sectionHeader}`]: {
    fontWeight: '700 ',
    paddingBottom: `${theme.spacing(1)}`,
    textTransform: 'uppercase',
  },
}))

const FaqEntry = styled(Box)(({ theme }) => ({
  paddingBottom: '30px',
  '& a': {
    color: theme.palette.blue,
  },
}))

export default FaqPage
