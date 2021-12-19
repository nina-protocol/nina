import { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
// import { useWallet } from '@solana/wallet-adapter-react'
import NinaClient from '../utils/client'

import dynamic from 'next/dynamic'
const {useWallet} = dynamic(
  () => import('@solana/wallet-adapter-react'),
  {ssr: false}
)

const ExchangeListItem = (props) => {
  const {
    expectedAmount,
    isSelling,
    isCurrentUser,
    release,
    solPrice,
    symbol,
    amount,
  } = props

  const displayPrice = isSelling
    ? NinaClient.nativeToUiString(
        expectedAmount?.toNumber() || amount,
        release.paymentMint
      )
    : NinaClient.nativeToUiString(amount, release.paymentMint)

  const itemData = (
    <Root>
      <Typography>
        <span
          className={`
          ${classes.exchangeListItemPrice} 
          ${classes.exchangeListItemPrice}--${
            isCurrentUser ? 'currentUser' : ''
          }
          `}
        >
          {displayPrice}
        </span>
      </Typography>
      {NinaClient.isSol(release.paymentMint) && (
        <Typography
          className={`${classes.exchangeListItemPrice} ${classes.exchangeListItemPrice}--usd`}
        >
          {(
            NinaClient.nativeToUi(
              isSelling ? expectedAmount?.toNumber() : amount,
              release.paymentMint
            ) * solPrice
          ).toFixed(2)}{' '}
          USD
        </Typography>
      )}
      <Typography
        className={`${classes.exchangeListItemPrice} ${classes.exchangeListItemPrice}--symbol`}
      >
        1 {symbol}
      </Typography>
      <ExchangeListButton {...props} />
    </Root>
  )

  return (
    <li
      className={`
      ${classes.exchangeListItem} 
      ${classes.exchangeListItem}--${isSelling ? 'listing' : 'offer'}
      ${classes.exchangeListItem}--${isCurrentUser ? 'currentUser' : ''}
      `}
    >
      {itemData}
    </li>
  )
}

const ExchangeListButton = (props) => {
  const { onExchangeButtonAction, pending, isSelling, isCurrentUser } = props

  const wallet = useWallet()
  const [buttonText, setButtonText] = useState('Pending')

  useEffect(() => {
    if (wallet?.connected) {
      if (isCurrentUser) {
        if (pending) {
          setButtonText('Pending')
        } else {
          setButtonText('Cancel')
        }
      } else {
        setButtonText(isSelling ? 'Buy' : 'Accept')
      }
    } else {
      setButtonText(isSelling ? 'Buy' : 'Accept')
    }
  }, [wallet?.connected, pending, isCurrentUser, isSelling])

  if (wallet?.connected && !pending) {
    return (
      <Button
        variant="outlined"
        className={`
          ${classes.exchangeListButton} 
          ${classes.exchangeListButton}--${buttonText}
          `}
        color="primary"
        onClick={() => onExchangeButtonAction(props)}
      >
        {buttonText}
      </Button>
    )
  } else {
    return (
      <Button
        className={classes.exchangeListButton}
        variant="outlined"
        color="primary"
        disabled
      >
        {buttonText}
      </Button>
    )
  }
}

const PREFIX = 'ExchangeList'

const classes = {
  root: `${PREFIX}-root`,
  exchangeListItemPrice: `${PREFIX}-exchangeListItemPrice`,
  exchangeListButton: `${PREFIX}-exchangeListButton`,
  noOffers: `${PREFIX}-noOffers`,
}

const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px',
  [`& .${classes.exchangeListItemPrice}`]: {
    fontWeight: '700',
    color: `${theme.palette.blue}`,
    ...theme.helpers.baseFont,
    '&--currentUser': {
      fontWeight: '400',
      color: `${theme.palette.grey.primary}`,
    },
    '&--usd': {
      color: `${theme.palette.greyLight}`,
    },
    '&--symbol': {
      fontWeight: '400',
      color: `${theme.palette.black}`,
    },
  },

  [`& .${classes.exchangeListButton}`]: {
    backgroundColor: `${theme.palette.white}`,
    fontSize: `10px`,
    color: `${theme.palette.black}`,
    borderColor: `${theme.palette.black}`,
    padding: `${theme.spacing(0.5, 1)} !important`,
    width: '100px',
    borderRadius: theme.vars.borderRadius,
    margin: 0,
    '&:hover': {
      backgroundColor: `${theme.palette.white} !important`,
      color: theme.palette.blue,
      borderColor: theme.palette.blue,
    },
    '&--Cancel': {
      borderColor: `${theme.palette.grey}`,
      color: `${theme.palette.grey}`,
      backgroundColor: `${theme.palette.white}`,
      '&:hover': {
        borderColor: `${theme.palette.grey}`,
        color: `${theme.palette.grey}`,
      },
    },
  },
}))

export default ExchangeListItem
