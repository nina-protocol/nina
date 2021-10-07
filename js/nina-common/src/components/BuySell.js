import React, { useState } from 'react'
import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'
import BuySellForm from './BuySellForm'

const BuySell = (props) => {
  const { inCollection, release, isBuy, onSubmit } = props
  const classes = useStyles()
  const [amount, setAmount] = useState(undefined)

  return (
    <Box className={classes.buySell}>
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
    </Box>
  )
}

const useStyles = makeStyles((theme) => ({
  buySell: {
    width: '100%',
    maxWidth: '310px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    alignItems: 'flex-start',
    [theme.breakpoints.down('sm')]: {
      padding: '0 10px',
    },
  },
  buySellHeading: {
    fontSize: '26px',
    fontWeight: '700',
    textTransform: 'uppercase',
    [theme.breakpoints.down('sm')]: {
      fontSize: '14px',
    },
  },
  buySellCopy: {
    textAlign: 'left',
    fontSize: '10px',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}))

export default BuySell
