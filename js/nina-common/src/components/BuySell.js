import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { Typography } from '@mui/material'
import BuySellForm from './BuySellForm'

const BuySell = (props) => {
  const { inCollection, release, isBuy, onSubmit, symbol} = props

  const [amount, setAmount] = useState(undefined)

  return (
    <StyledBuySell className={classes.buySell}>
      <Typography variant="h2" className={classes.buySellHeading}>
        {isBuy ? 'Make Buy Offer' : 'List for sale'}
      </Typography>
      <Typography variant="subtitle1" align="left">
        {isBuy
          ? `Enter the price you’d be willing to pay for 1 ${symbol}. Your offer will be locked in until accepts it or you cancel it.`
          : `Want to sell your ${symbol}? List yours for other users to purchase - if sold the funds will be sent directly to your wallet.`}
      </Typography>
      <BuySellForm
        inCollection={inCollection}
        onSubmit={onSubmit}
        amount={amount}
        setAmount={setAmount}
        isBuy={isBuy}
        release={release}
      />
    </StyledBuySell>
  )
}

const PREFIX = 'BuySell'

const classes = {
  buySell: `${PREFIX}-buySell`,
  buySellHeading: `${PREFIX}-buySellHeading`,
  buySellCopy: `${PREFIX}-buySellCopy`,
}

const StyledBuySell = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  alignItems: 'flex-start',
  borderBottom: `1px solid ${theme.palette.grey.primary}`,
  [`& .${classes.buySellHeading}`]: {
    fontWeight: '700 !important',
    textTransform: 'uppercase',
  },
}))

export default BuySell
