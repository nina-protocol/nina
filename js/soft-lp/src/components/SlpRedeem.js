import React from 'react'
import { styled } from '@mui/material/styles'

import Box from '@mui/material/Box'
import { Typography } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import ninaCommon from 'nina-common'
import SlpUserRedemptions from './SlpUserRedemptions'

const { RedeemableModal } = ninaCommon.components

const SlpRedeem = (props) => {
  const { releasePubkey, amountHeld, userRedemptionRecords, redeemables } =
    props

  const wallet = useWallet()

  return (
    <StyledBox className={classes.root}>
      <Box className={classes.ctaWrapper}>
        {amountHeld < 1 && (
          <Box className={classes.noCoinWrapper}>
            <Typography
              variant="h5"
              className={classes.noCoinHeader}
              gutterBottom
            >
              You dont have any Soft LP
            </Typography>
            <Typography variant="body1" className={classes.noCoinCopy}>
              purchase SOFT on our <strong>MARKET</strong> to enable redemption.
            </Typography>
          </Box>
        )}

        {wallet.connected && amountHeld > 0 && (
          <Box>
            <Typography
              variant="h5"
              className={classes.noCoinCopy}
              gutterBottom
            >
              You have {amountHeld} SOFT
            </Typography>
          </Box>
        )}

        <RedeemableModal
          releasePubkey={releasePubkey}
          amountHeld={amountHeld}
        />

        {userRedemptionRecords?.length > 0 && (
          <SlpUserRedemptions
            userRedemptionRecords={userRedemptionRecords}
            redeemables={redeemables}
          />
        )}
      </Box>

      <Box className={classes.info}>
        <Typography variant="h4" className={classes.infoHeader}>
          {`Nina's redemption program lets artists use their tokenized releases to distribute physical goods.`}
        </Typography>
        <Typography className={classes.infoSubheader}>
          <strong>In this case, The Soft LP physical slipmat.</strong> The steps
          to redeem are:
        </Typography>

        <Box>
          <ol className={classes.redeemableSteps}>
            <li>
              <Typography className={classes.step}>
                {`If you are connected with a wallet that contains at least 1 SOFT, tap the redeem button over there.`}
              </Typography>
            </li>
            <li>
              <Typography className={classes.step}>
                {`Enter and confirm your shipping information. This info is encrypted and stored on-chain - only the creator can decrypt it.`}
              </Typography>
            </li>
            <li>
              <Typography className={classes.step}>
                {`Once the shipping info is stored, the original publisher will be notified of the redemption. The publisher ships the physical good, then enters the tracking info which is only able to be read by the redeemer and the shipper.`}
              </Typography>
            </li>
            <li>
              <Typography className={classes.step}>
                {`Wait for your package to arrive, then enjoy!`}
              </Typography>
            </li>
          </ol>
        </Box>
      </Box>
    </StyledBox>
  )
}

const PREFIX = 'SlpRedeem'

const classes = {
  root: `${PREFIX}-root`,
  noCoinWrapper: `${PREFIX}-noCoinWrapper`,
  noCoinHeader: `${PREFIX}-noCoinHeader`,
  paper: `${PREFIX}-paper`,
  ctaWrapper: `${PREFIX}-ctaWrapper`,
  info: `${PREFIX}-info`,
  infoHeader: `${PREFIX}-infoHeader`,
  infoSubheader: `${PREFIX}-infoSubheader`,
  redeemableSteps: `${PREFIX}-redeemableSteps`,
  step: `${PREFIX}-step`,
  redeemCta: `${PREFIX}-redeemCta`,
}

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '1000px',
    marginLeft: '-100px',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },

  [`& .${classes.noCoinWrapper}`]: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },

  [`& .${classes.noCoinHeader}`]: {
    fontSize: '26px',
  },

  [`& .${classes.paper}`]: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    width: '75%',
    overflowY: 'auto',
  },

  [`& .${classes.ctaWrapper}`]: {
    width: '400px',
    paddingRight: '150px',
    [theme.breakpoints.down('md')]: {
      width: '85%',
      paddingRight: '0',
    },
  },

  [`& .${classes.info}`]: {
    width: '400px',
    textAlign: 'left',
    [theme.breakpoints.down('md')]: {
      width: '85%',
      padding: `${theme.spacing(2, 1)}`,
    },
  },

  [`& .${classes.infoHeader}`]: {
    fontSize: '26px',
    lineHeight: '29.9px',
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      fontSize: '18px',
    },
  },

  [`& .${classes.infoSubheader}`]: {
    fontSize: '11px',
    marginBottom: theme.spacing(1),
  },

  [`& .${classes.redeemableSteps}`]: {
    paddingLeft: theme.spacing(2),
    '& li': {
      fontSize: '10px',
    },
  },

  [`& .${classes.step}`]: {
    fontSize: '11px;',
  },

  [`& .${classes.redeemCta}`]: {
    color: 'black',
    '& --disabled': {
      color: `${theme.palette.greyLight}`,
    },
  },
}))

export default SlpRedeem
