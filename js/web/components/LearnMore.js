import React, { Fragment } from 'react'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Link from 'next/link'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import Image from 'next/image'

const LearnMore = () => {
  const examples = [
    {
      header: 'Limited Editions',
      body: 'Release a limited quantity of your release. You can set the number of editions you want to release when publishing.',
      image: '/images/LimitedEdition.png',
      link: 'https://ninaprotocol.com/Hy42kGTy6HqJgTkBcvb8YoUjgwP46TLqbpz9nWHSHomM',
      linkText: 'Surgeon, Jet Pack Mack',
    },
    {
      header: 'Open Editions',
      body: 'Create an unlimited supply of your release. You can close the sale at any time and your release will be sold out.',
      image: '/images/OpenEdition.png',
      link: 'https://ninaprotocol.com/8etCo8Gso93PLLjZeXWubjdm4Qd5NqLGL8qtHm76x5cN',
      linkText: 'Dasychira, Banyan Tree',
    },
    {
      header: 'Closed Editions',
      body: `Close the sale of your release at any time (possible for limited and open editions). The release will then be sold out, but it can still be sold on the secondary market.`,
      image: '/images/ClosedEdition.png',
      link: 'https://ninaprotocol.com/7oR7ETJW9QYXWm25mgLjP4kTRmjPGgQsH4HP1uwDGyKW',
      linkText: 'dBridge, Private Skies',
    },
    {
      header: 'Gates',
      body: `Include additional material only available to fans who purchase your release—lossless files, bonus tracks, videos, PDFs, etc.`,
      image: '/images/Gates.png',
      link: 'https://ninaprotocol.com/2QfDZcQnT51mQTFrWfzKTPPDrB7G3rk5fSif1WTA7Dqd',
      linkText: 'gantz, evoker',
    },
    {
      header: 'Editorial',
      body: `Share additional context around your releases or make blog posts to share updates, stories, and musings with your community.`,
      image: '/images/Posts.png',
      link: `https://hubs.ninaprotocol.com/ledisko/posts/8BEauXrASkugBm6gR4wkH3T5RU5JAuwLwybkfbF1Pg7W`,
      linkText: `Gesloten Cirkel, Detoon`,
    },
  ]

  const faqs = [
    {
      question: 'What can I release on Nina?',
      answer:
        'Anything. Tracks, live sets, demos, b-sides, podcasts, recordings of your fireplace, etc',
    },
    {
      question: 'Do my releases on Nina need to be exclusive?',
      answer:
        'No. You can release your music anywhere else, Nina is another home for your music, like Bandcamp and SoundCloud. Open Editions are an easy way to release music that is available elsewhere.',
    },
    {
      question: 'Do I have to pay to start using Nina?',
      answer:
        'No. We also cover costs for artists and label to get set up, helping you get storage space and bandwidth for your releases.',
    },
    {
      question: 'How are releases on Nina priced?',
      answer: (
        <Fragment>
          You can set whatever price you want when you publish your release.
          Most releases you will find Nina are $1-5, but some artists have found
          success with higher prices (see{' '}
          <Link
            href={
              'https://www.ninaprotocol.com/FnuxAi3gFDZ5RE8HYKDk7MbAqycTcWrt6ThVpJXPbrd7'
            }
          >
            <a target="_blank">Joanna7459</a>
          </Link>
          ). Artists on Nina receive 100% of their sales.
        </Fragment>
      ),
    },
    {
      question: 'Can I make my releases free?',
      answer: 'Yes. Just set the price to 0 when you publish.',
    },
    {
      question: 'Why is Nina built on the blockchain?',
      answer: (
        <Fragment>
          {`Nina utilizes the blockchain to allow artists to have the most
          control over their work. Publishing music on-chain allows artists to
          side-step platform fees and keep 100% of their sales. The technology
          enables easy revenue split automation, royalties on resales, shared
          pages with collaborators, and permanent web archiving via hosting on`}{' '}
          <Link href={'https://arweave.org/'}>
            <a target="_blank">Arweave</a>
          </Link>
          {`    . We know a lot of artists are rightfully skeptical about anything
          blockchain-related, so we try to help them get comfortable with our
          tools so they can decide whether it's for them or not.`}
        </Fragment>
      ),
    },
    {
      question: 'How do you buy music on Nina?',
      answer: (
        <Fragment>
          You need a Solana wallet (we recommend{' '}
          <Link href={'https://phantom.app/'}>
            <a target="_blank">Phantom</a>
          </Link>
          ) funded with SOL or USDC to purchase music on Nina. To fund a wallet,
          you can either purchase SOL with a credit card from inside the Phantom
          wallet, or you can buy SOL on an exchange like{' '}
          <Link href={'https://www.coinbase.com/'}>
            <a target="_blank">Coinbase</a>
          </Link>{' '}
          and send it to your Phantom wallet.
        </Fragment>
      ),
    },
  ]

  return (
    <ScrollablePageWrapper>
      <StyledGrid>
        <LearnMoreWrapper>
          <Box mb={2}>
            <Typography variant="h2">
              {`Nina is an independent music ecosystem that offers artists new models
          for releasing music. Below you can learn more about how it works and
          see a list of FAQs.`}
            </Typography>
          </Box>
          <Box mt={2} mb={1}>
            <Typography
              variant="h3"
              sx={{ textDecoration: 'underline' }}
            >{`How you can use Nina:`}</Typography>
            {examples.map((example, index) => (
              <ExampleContainer key={index}>
                <ExampleHeader variant="h2">{example.header}</ExampleHeader>
                <ExampleBody variant="h4">{example.body}</ExampleBody>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Link href={example.link}>
                    <a target="_blank" style={{ width: 'max-content' }}>
                      <Typography marginBottom={'15px'}>
                        {example.linkText}
                      </Typography>
                    </a>
                  </Link>
                  <Box
                    sx={{
                      border: '1px solid black',
                      width: '66%',
                      marginBottom: '15px',
                      padding: '15px',
                      width: { xs: '90%', sm: '66%' },
                    }}
                  >
                    <Link href={example.link}>
                      <a target="_blank">
                        <Image
                          layout="responsive"
                          width={660}
                          height={404}
                          src={example.image}
                          alt={example.linkText}
                          style={{
                            objectFit: 'contain',
                            width: '90%',
                            height: 'auto'
                          }}
                          loader={({ src }) => {
                            return src
                          }}
                        />
                      </a>
                    </Link>
                  </Box>
                </Box>
              </ExampleContainer>
            ))}
          </Box>
          <Box mb={2}>
            <Typography variant="h2">{`FAQ`}</Typography>
            {faqs.map((faq, index) => (
              <FaqBox key={index}>
                <Typography
                  variant="h3"
                  fontWeight={'bold'}
                  style={{ marginBottom: '15px' }}
                >
                  {faq.question}
                </Typography>
                <Box sx={{ paddingLeft: {xs: '0px', md: '15px'} }}>
                  <Typography
                    variant=""
                    fontWeight={'normal'}
                    sx={{ width: '50%' }}
                  >
                    {faq.answer}
                  </Typography>
                </Box>
              </FaqBox>
            ))}
          </Box>
        </LearnMoreWrapper>
      </StyledGrid>
    </ScrollablePageWrapper>
  )
}

const StyledGrid = styled(Grid)(({ theme }) => ({
  paddingTop: '20px',
  maxHeight: '90vh',
  overflowY: 'scroll',
  justifyContent: 'center',
  alignItems: 'center',
  '& a': {
    textDecoration: 'none',
    color: theme.palette.blue,
    '&:hover': {
      opacity: '85%',
    },
  },
}))

const LearnMoreWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: '100px auto ',
  display: 'flex',
  flexDirection: 'column',
  gridColumn: '1/3',
  maxWidth: '1000px',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    width: '80%',
  },
}))

const FaqBox = styled(Box)(({ theme }) => ({
  width: '50%',
  marginTop: '15px',
  marginBottom: '15px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}))

const ExampleHeader = styled(Typography)(({ theme }) => ({
  marginTop: '30px',
  fontSize: '30px !important',
  [theme.breakpoints.down('md')]: {
    fontSize: '20px !important',
  },
}))

const ExampleBody = styled(Typography)(({ theme }) => ({
  marginTop: '15px',
  marginBottom: '15px',
  width: '50%',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}))

const ExampleContainer = styled(Box)(() => ({
  marginBottom: '30px',
}))

export default LearnMore
