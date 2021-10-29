import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { Typography } from '@mui/material'
import BuySellForm from './BuySellForm'

const BuySell = (props) => {
  const { inCollection, release, isBuy, onSubmit } = props

  const [amount, setAmount] = useState(undefined)

  return (
    <StyledBox className={classes.buySell}>
      <Typography className={classes.buySellHeading}>
        {isBuy ? 'Make Buy Offer' : 'List for sale'}
      </Typography>
      <Typography className={classes.buySellCopy}>
        {isBuy
          ? 'Enter the price you’d be willing to pay for 1 SOFT. Your offer will be locked in until accepts it or you cancel it.'
          : 'Want to sell your SOFT? List yours for other users to purchase - if sold the funds will be sent directly to your wallet.'}
      </Typography>
      <BuySellForm
        inCollection={inCollection}
        onSubmit={onSubmit}
        amount={amount}
        setAmount={setAmount}
        isBuy={isBuy}
        release={release}
      />
    </StyledBox>
  )
}

const PREFIX = 'BuySell'

const classes = {
  buySell: `${PREFIX}-buySell`,
  buySellHeading: `${PREFIX}-buySellHeading`,
  buySellCopy: `${PREFIX}-buySellCopy`,
}

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.buySell}`]: {
    width: '100%',
    maxWidth: '310px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    alignItems: 'flex-start',
    [theme.breakpoints.down('md')]: {
      padding: '0 10px',
    },
  },

  [`& .${classes.buySellHeading}`]: {
    fontSize: '26px',
    fontWeight: '700',
    textTransform: 'uppercase',
    [theme.breakpoints.down('md')]: {
      fontSize: '14px',
    },
  },

  [`& .${classes.buySellCopy}`]: {
    textAlign: 'left',
    fontSize: '10px',
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
}))

export default BuySell
