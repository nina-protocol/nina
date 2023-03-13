import React from 'react'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import NinaBox from '@nina-protocol/nina-internal-sdk/esm/NinaBox'
import Image from 'next/image'
import { imageManager } from '@nina-protocol/nina-internal-sdk/esm/utils'
import Link from 'next/link'
import ScrollablePageWrapper from './ScrollablePageWrapper'
const { loader } = imageManager
const LearnMore = () => {
  return (
    <ScrollablePageWrapper>
      <StyledGrid>
        <LearnMoreWrapper>
          <Typography variant="h1">
            {`Nina is an independent music ecosystem that offers artists new models
          for releasing music. Below you can learn more about how it works and
          see a list of FAQs.`}
          </Typography>
          <Typography variant="h1" mt={2}>{`How you can use Nina`}</Typography>
          {/* limited editions */}
          <Box mb={2}>
            <Typography variant="h2" mt={2}>{`Limited Editions`}</Typography>
            <Typography variant="h4" mt={1} mb={2}>
              {`Release a limited quantity of your release. You can set the number
              of editions you want to release when publishing.`}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                href={`https://ninaprotocol.com/Hy42kGTy6HqJgTkBcvb8YoUjgwP46TLqbpz9nWHSHomM`}
              >
                <a>{`Surgeon, Jet Pack Mack`}</a>
              </Link>

              <Link
                href={`https://ninaprotocol.com/Hy42kGTy6HqJgTkBcvb8YoUjgwP46TLqbpz9nWHSHomM`}
              >
                <a>
                  <img
                    layout="responsive"
                    src={'/images/LimitedEdition.png'}
                    alt="some text"
                    style={{
                      width: '75%',
                      height: 'auto',
                    }}
                  />
                </a>
              </Link>
            </Box>
          </Box>
          {/* open editions */}
          <Box mb={2}>
            <Typography variant="h2" mt={2}>{`Open Editions`}</Typography>
            <Typography variant="h4" mt={1} mb={2}>
              {`Create an unlimited supply of your release. You can close the sale at any time and your release will be sold out. `}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                href={`https://ninaprotocol.com/8etCo8Gso93PLLjZeXWubjdm4Qd5NqLGL8qtHm76x5cN`}
              >
                <a>{`Dasychira, Banyan Tree`}</a>
              </Link>
              <Link
                href={`https://ninaprotocol.com/8etCo8Gso93PLLjZeXWubjdm4Qd5NqLGL8qtHm76x5cN`}
              >
                <a>
                  <img
                    layout="responsive"
                    src="/images/OpenEdition.png"
                    alt="some text"
                    style={{
                      width: '75%',
                      height: 'auto',
                    }}
                  />
                </a>
              </Link>
            </Box>
          </Box>
          {/* closed editions */}
          <Box mb={2}>
            <Typography variant="h2" mt={2}>{`Closed Editions`}</Typography>
            <Typography variant="h4" mt={1} mb={2}>
              {`Close the sale of your release at any time (possible for limited and open editions). The release will then be sold out, but it can still be sold on the secondary market.`}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                href={`https://ninaprotocol.com/7oR7ETJW9QYXWm25mgLjP4kTRmjPGgQsH4HP1uwDGyKW`}
              >
                <a
                  style={{ marginBottom: '16px' }}
                >{`dBridge, Private Skies`}</a>
              </Link>
              <Link
                href={`https://ninaprotocol.com/7oR7ETJW9QYXWm25mgLjP4kTRmjPGgQsH4HP1uwDGyKW`}
              >
                <a>
                  <img
                    layout="responsive"
                    src="/images/ClosedEdition.png"
                    alt="some text"
                    style={{
                      width: '75%',
                      height: 'auto',
                    }}
                  />
                </a>
              </Link>
            </Box>
          </Box>
          {/* gates */}
          <Box mb={2}>
            <Typography variant="h2" mt={2}>{`Gates`}</Typography>
            <Typography variant="h4" mt={1} mb={2}>
              {`Include additional material only available to fans who purchase your release—lossless files, bonus tracks, videos, PDFs, etc.`}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                href={`https://ninaprotocol.com/2QfDZcQnT51mQTFrWfzKTPPDrB7G3rk5fSif1WTA7Dqd`}
              >
                <a style={{ marginBottom: '16px' }}>{`gantz, evoker`}</a>
              </Link>
              <Link
                href={`https://ninaprotocol.com/2QfDZcQnT51mQTFrWfzKTPPDrB7G3rk5fSif1WTA7Dqd`}
              >
                <a>
                  <img
                    layout="responsive"
                    src="/images/Gates.png"
                    alt="some text"
                    style={{
                      width: '75%',
                      height: 'auto',
                    }}
                  />
                </a>
              </Link>
            </Box>
          </Box>
          {/* editorial */}
          <Box mb={2}>
            <Typography variant="h2" mt={2}>{`Editorial`}</Typography>
            <Typography variant="h4" mt={1} mb={2}>
              {`Share additional context around your releases or make blog posts to share updates, stories, and musings with your community.`}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                href={`https://hubs.ninaprotocol.com/ledisko/posts/8BEauXrASkugBm6gR4wkH3T5RU5JAuwLwybkfbF1Pg7W`}
              >
                <a>{`Gesloten Cirkel, Detoon`}</a>
              </Link>
              <Link
                href={`https://hubs.ninaprotocol.com/ledisko/posts/8BEauXrASkugBm6gR4wkH3T5RU5JAuwLwybkfbF1Pg7W`}
              >
                <a target="_blank">
                  <img
                    layout="responsive"
                    src="/images/Posts.png"
                    alt="some text"
                    style={{
                      width: '75%',
                      height: 'auto',
                    }}
                  />
                </a>
              </Link>
            </Box>
          </Box>
          {/* FAQ */}
          <Box mt={2} mb={2}>
            <Typography variant="h1">{`FAQ`}</Typography>
            <Box mt={1} mb={1}>
              <Typography variant="h3">{`What can I release on Nina?`}</Typography>
              <Typography variant="">
                {`    Anything. Tracks, live sets, demos, b-sides, podcasts,
                    recordings of your fireplace, etc`}
              </Typography>
            </Box>
            <Box mt={1} mb={1}>
              <Typography variant="h3">{`Do my releases on Nina need to be exclusive?`}</Typography>
              <Typography variant="">
                {`No. You can release your music anywhere else, Nina is another home for your music, like Bandcamp and SoundCloud. Open Editions are an easy way to release music that is available elsewhere.`}
              </Typography>
            </Box>
            <Box mt={1} mb={1}>
              <Typography variant="h3">{`Do I have to pay to start using Nina?`}</Typography>
              <Typography variant="">
                {`No. We also cover costs for artists and label to get set up,
                helping you get storage space to host as much music as you want.`}
              </Typography>
            </Box>
            <Box mt={1} mb={1}>
              <Typography variant="h3">{`Can I release albums on Nina?`}</Typography>
              <Typography variant="">
                {`While we don’t have a specific albums feature (coming in 2023), many artists have albums on Nina. You can either release them track-by-track (see 29 Speedway) or put the tracks from your release in a single audio file (see Voor & Shore).`}
              </Typography>
            </Box>
            <Box mt={1} mb={1}>
              <Typography variant="h3">{`How are releases on Nina priced?`}</Typography>
              <Typography variant="">
                {`You can set whatever price you want when you publish your release. Most releases you will find Nina are $1-5, but some artists have found success with higher prices (see Joanna7459). Artists on Nina receive 100% of their sales.`}{' '}
              </Typography>
            </Box>
            <Box mt={1} mb={1}>
              <Typography variant="h3">{`Can I make my releases free?`}</Typography>
              <Typography variant="">
                {`Yes. Just set the price to 0 when you publish.`}{' '}
              </Typography>
            </Box>
            <Box mt={1} mb={1}>
              <Typography variant="h3">{`Why is Nina built on the blockchain?`}</Typography>
              <Typography variant="">
                {`Nina utilizes the blockchain to allow artists to have the most control over their work. Publishing music on-chain allows artists to side-step platform fees and keep 100% of their sales. The technology enables easy revenue split automation, royalties on resales, shared pages with collaborators, and permanent web archiving via hosting on Arweave. We know a lot of artists are rightfully skeptical about anything blockchain-related, so we try to help them get comfortable with our tools so they can decide whether it's for them or not.`}{' '}
              </Typography>
            </Box>
            <Box mt={1} mb={1}>
              <Typography variant="h3">{`How do you buy music on Nina?`}</Typography>
              <Typography variant="">
                {`You need a Solana wallet (we recommend Phantom) funded with SOL or USDC to purchase music on Nina. To fund a wallet, you can either purchase SOL with a credit card from inside the Phantom waller, or you can buy SOL on an exchange like Coinbase and send it to your Phantom wallet.`}
              </Typography>
            </Box>
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

const LearnMoreWrapper = styled(Box)(() => ({
  width: '100%',
  margin: '100px auto ',
  display: 'flex',
  flexDirection: 'column',
  gridColumn: '1/3',
  maxWidth: '1000px',
  textAlign: 'left',
}))

export default LearnMore
