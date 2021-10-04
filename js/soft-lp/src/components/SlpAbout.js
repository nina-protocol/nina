import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import { Typography } from '@material-ui/core'
import Divider from '@material-ui/core/Divider'
import ninaCommon from 'nina-common'

const { NinaClient } = ninaCommon.utils

const SlpAboutModal = () => {
  const classes = useStyles()

  return (
    <Box className={classes.root}>
      <div className={classes.paper}>
        <Box className={classes.article}>
          <Typography
            variant="body1"
            gutterBottom
            className={classes.disclaimer}
          >
            Disclaimer: This is un-audited code, use at your own risk. View the
            <a
              className={classes.repo}
              href="https://github.com/nina-market/nina"
              target="_blank"
              rel="noreferrer"
            >
              {' '}
              source code here.
            </a>
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
            className={classes.disclaimer}
          >
            Nina Program Id:
            <a
              className={classes.repo}
              href={`https://solscan.io/account/${
                NinaClient.ids().programs.nina
              }`}
              target="_blank"
              rel="noreferrer"
            >
              {' '}
              {NinaClient.ids().programs.nina}
            </a>
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
            className={classes.disclaimer}
          >
            SOFT mint:
            <a
              className={classes.repo}
              href={`https://solscan.io/account/softt2KpcvJJsFL8zGKeaCpjtkGzkT8sewExYuw3WkN`}
              target="_blank"
              rel="noreferrer"
            >
              {' '}
              softt2KpcvJJsFL8zGKeaCpjtkGzkT8sewExYuw3WkN
            </a>
          </Typography>

          <Divider className={classes.divider} />

          <Typography variant="h4" gutterBottom className={classes.title}>
            The Soft LP
          </Typography>
          <Typography variant="body1" gutterBottom>
            Welcome to the Soft LP. The Soft LP is a tokenized slipmat for
            turntables that will be distributed through Nina’s programs on
            Solana. There will be 1000 Soft LPs available for 1 SOL/each.
          </Typography>
          <Typography variant="body1" gutterBottom>
            The behaviors of the Soft LP are:
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
            className={classes.paragraph}
          >
            <span>- Initial purchase</span>
            <span>- Buy / Sell on our secondary market</span>
            <span>- Redeem token for physical slipmat</span>
          </Typography>
          <Typography variant="body1" gutterBottom>
            We are releasing The Soft LP to inaugurate Nina and test our
            programs on Solana’s mainnet to ensure that once we start onboarding
            musicians the experience is smooth from day 1.
          </Typography>

          <Typography variant="h4" gutterBottom className={classes.title}>
            Who Is Nina?
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
            className={classes.paragraph}
          >
            <span>
              Nina is a small team of friends that grew up in the music world.
              We’ve been making and distributing music since 2004 — running
              labels, recording, touring, putting on shows and festivals, and
              simply being fans.
            </span>
            <span>
              On February 16 at McSorley’s Bar in NYC, the question “have you
              heard of NFTs?” was asked. The next day we began tinkering with
              the idea of using new technology to make records online more like
              physical records. We discussed the exploitative nature of the
              music industry, especially at the intersection with big tech
              platforms and saw that decentralization can be the catalyst to fix
              a decades old problem of inequity towards artists.
            </span>
            <span>
              After the light-bulb moment of seeing what the future of tokenized
              content could be, we immediately started building a way for
              musicians and fans to come together around digital music with as
              few middlemen as possible.
            </span>
            <span>Nina is the infrastructure of that future.</span>
          </Typography>

          <Typography variant="h4" gutterBottom className={classes.title}>
            Why The Soft LP?
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
            className={classes.paragraph}
          >
            <span>{`In music, an LP is a Long-Playing record. In crypto, it’s a Liquidity Provider. We could announce that we are selling a semi-fungible token which can be redeemed for a hand-silkscreened 11.75" x 0.125", 21oz, 100% polyester turntablist precision enhancer, but we want to let this be as simple as "The Soft LP."`}</span>
            <span>
              A tenet of our mission is to demystify crypto in order to bring
              its benefits to a wider audience, beyond those who have been
              educated in blockchain technology. We believe that on-chain
              behavior can be most widely beneficial when it is “under the
              hood.”
            </span>
            <span>
              We are creating tools that allow artists and fans to interact
              on-chain in a way that feels like the internet we are familiar
              with.
            </span>
            <span>
              Driving a car does not require an understanding of the intricacies
              of internal combustion; we believe web3 should be just as
              intuitive. You can look under the hood, or you can simply cruise.
            </span>
          </Typography>

          <Typography variant="h4" gutterBottom className={classes.title}>
            Music, Simply.
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
            className={classes.paragraph}
          >
            <span>
              The best way to demystify new ideas is to leverage familiar
              concepts. When an artist releases a track on Nina, they only need
              to think of it as exactly that: their track. Cryptography gives us
              transparency and permanence, but cryptography is not part of the
              formula for a catchy tune. Cryptography is not what a fan is
              thinking about when they hear a lyric that resonates with them.
            </span>
            <span>
              Nina is a toolset designed to deliver the benefits of web3 to
              musicians and their fans without a learning curve. Nina delivers
              immediate value, not speculative value. Once a song is published,
              it is immediately purchasable. A fan does not have to own the song
              to stream it; ownership serves as a tool in a patronage model,
              with artists receiving 100% of primary sales and perpetual royalty
              percentage of all secondary sales.
            </span>
            <span>
              When fans purchase releases from musicians on Nina, they enter an
              immutable, verified relationship. Fans support artists directly,
              and artists have access to every one of their supporters. The
              transparency of the ownership of tokenized releases will enable
              artists to interact with their communities of supporters. This
              might mean giving them access to special content or exclusive
              opportunities. We are not dictating the flavor of what an artist’s
              community can be; we are simply giving them the tools to harness
              it.
            </span>
          </Typography>

          <Typography variant="h4" gutterBottom className={classes.title}>
            Really, It’s Yours
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
            className={classes.paragraph}
          >
            <span>
              The last decade of web2 has created a transient internet where
              content comes and goes. Your favorite music video on YouTube might
              disappear at any minute. Your favorite artist’s catalog might be
              pulled from Spotify. A platform might change its terms, decoupling
              creators from their fans and followers.
            </span>
            <span>
              The entire Nina team grew up in the DIY music world. In the
              physical world, a record you purchase is yours forever. It is not
              subject to Terms and Conditions. It is not featured on a playlist
              one day and gone the next.
            </span>
            <span>
              Let us state the obvious: a record is a tool that stores and plays
              your music. A record is a listening mechanism that is always
              available, always yours, and unaffected by external forces.
            </span>
            <span>A record on Nina is the same.</span>
          </Typography>

          <Typography variant="h4" gutterBottom className={classes.title}>
            Isn’t Nina For Music?
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
            className={classes.paragraph}
          >
            <span>
              A week or two after The Soft LP comes the Soft Launch Period. We
              will publish releases from our first artists in small batches
              every few days for ~1 month. Starting small will allow us to
              fine-tune the UX and ensure that everything is working as
              intended.
            </span>
            <span>
              During the Soft Launch Period, we will also be distributing
              publishing credits to interested artists beyond those we have
              already onboarded directly. If you are interested in being one of
              the first artists publishing on Nina, get in touch!
            </span>
            <span>
              Around mid-November we will fully open the protocol, allowing
              anyone to publish and distribute their music.
            </span>
          </Typography>

          <Typography variant="h4" gutterBottom className={classes.title}>
            A Slipmat Is a Tool
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
            className={classes.paragraph}
          >
            <span>
              The slipmat was invented by Grandmaster Flash to allow more
              precision in cueing albums on a record player. A slipmat reduces
              friction when DJs need to wind tracks counter-clockwise. It sits
              directly under the record and provides the DJ with more control.
              The slipmat supports the record and optimizes delivery.
            </span>
            <span>
              We could have sold stickers, or hats, or mugs (and we may), but
              for our debut experience the Soft LP and a slipmat’s relationship
              to records, tactility, and the entire listening experience felt
              like a perfect starting point.
            </span>
            <span>
              Nina is like a slipmat. Our protocol provides the infrastructure
              to support music, musicians, and listeners from below. The
              protocol is designed to jell with artists’ existing online
              presences, not to become yet another platform to maintain. Nina is
              in the background — a support.
            </span>
            <span>
              We allow artists and fans to listen with precision, something we
              internally refer to as “intent.” Digital Streaming Platforms run
              on algorithmic suggestion engines that turn listening into a
              background experience. DSPs have you hit play and forget that
              you’re listening, perfect for soundtracking a salon or cafe. We
              don’t believe that the passion and dedication seen in music
              communities should be a polished and inoffensive hum in the back.
            </span>
            <span>
              Nina enables artists to step back into the foreground, it enables
              fans to listen and support with intent. Music — from writing to
              listening, from concerts to T-shirts, as a culture and an
              experience — is driven by communities. Listeners, fans, musicians,
              artists. They deliver the music, they share it with their friends,
              they catalyze the experience. Nina gives that experience
              permanence, transparency, and control on all sides
            </span>
            <span>
              If you are an artist interested in publishing on Nina, we want to
              talk. Email us at contact@nina.market or DM us on twitter{' '}
              <a
                href="https://twitter.com/nina_market_"
                target="_blank"
                rel="noreferrer"
              >
                {' '}
                @nina_market_{' '}
              </a>{' '}
            </span>
          </Typography>
        </Box>
      </div>
    </Box>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    position: 'absolute',
    top: '0',
    width: '100%',
    height: '100%',
  },
  paper: {
    padding: theme.spacing(6, 4, 3),
    overflowY: 'auto',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(6, 2, 3),
    },
  },
  disclaimer: {
    fontStyle: 'italic',
    fontSize: '12px',
  },
  repo: {
    color: theme.vars.blue,
    '&:hover': {
      color: theme.vars.black,
    },
  },
  divider: {
    backgroundColor: theme.vars.blue,
    margin: '10px 0 10px',
  },
  article: {
    width: '600px',
    padding: '0 20px',
    textAlign: 'left',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      padding: '0',
    },
  },
  title: {
    paddingTop: '10px',
  },
  paragraph: {
    display: 'flex',
    flexDirection: 'column',
    '& span': {
      padding: '10px 0',
    },
    '& a': {
      color: `${theme.vars.black}`,
      '&:hover': {
        color: `${theme.vars.blue}`,
      },
    },
  },
}))

export default SlpAboutModal
