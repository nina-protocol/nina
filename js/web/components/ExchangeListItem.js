import { useContext, useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'

const ExchangeListItem = (props) => {
  const {
    expectedAmount,
    isSelling,
    initializer,
    release,
    solPrice,
    symbol,
    amount,
  } = props
  const { wallet } = useContext(Wallet.Context)
  const { ninaClient } = useContext(Nina.Context)
  const displayPrice = ninaClient.nativeToUiString(amount, release.paymentMint)

  const itemData = (
    <Root>
      <Typography>
        <span
          className={`
          ${classes.exchangeListItemPrice} 
          ${classes.exchangeListItemPrice}--${
            initializer.publicKey === wallet?.publicKey?.toBase58()
              ? 'currentUser'
              : ''
          }
          `}
        >
          {displayPrice}
        </span>
      </Typography>
      {ninaClient.isSol(release.paymentMint) && (
        <Typography
          className={`${classes.exchangeListItemPrice} ${classes.exchangeListItemPrice}--usd`}
        >
          {(
            ninaClient.nativeToUi(
              isSelling ? expectedAmount : amount,
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
      ${classes.exchangeListItem}--${
        initializer.publicKey === wallet?.publicKey?.toBase58()
          ? 'currentUser'
          : ''
      }
      `}
    >
      {itemData}
    </li>
  )
}

const ExchangeListButton = (props) => {
  const { onExchangeButtonAction, pending, isSelling, initializer } = props
  const { wallet } = useContext(Wallet.Context)
  const [buttonText, setButtonText] = useState('Pending')

  useEffect(() => {
    if (wallet?.connected) {
      if (initializer.publicKey === wallet?.publicKey?.toBase58()) {
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
  }, [wallet?.connected, pending, wallet?.publicKey, isSelling])

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
    borderRadius: '30px',
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
