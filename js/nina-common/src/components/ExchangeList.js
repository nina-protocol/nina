import { useEffect, useState, useContext } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/core/styles'
import { useWallet } from '@solana/wallet-adapter-react'
import { NinaContext } from '../contexts'
import NinaClient from '../utils/client'
import {createLogicalAnd} from 'typescript'

const ExchangeList = (props) => {
  let { list, onExchangeButtonAction, release, metadata } = props
  const classes = useStyles()
  const { solPrice } = useContext(NinaContext)

  if (!list) {
    return (
      <div>
        <CircularProgress color="inherit" />
      </div>
    )
  }

  return (
    <Box className={classes.root}>
      {list?.length > 0 && (
        <ul className={classes.exchangeList}>
          {list.map((item, i) => (
            <ExchangeListItem
              key={i}
              {...item}
              onExchangeButtonAction={onExchangeButtonAction}
              release={release}
              solPrice={solPrice}
              symbol={metadata?.symbol}
            />
          ))}
        </ul>
      )}
      {list?.length === 0 && (
        <Typography variant="h6" align="center" className={classes.noOffers}>
          No offers
        </Typography>
      )}
    </Box>
  )
}

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
  const classes = useStyles()

  const displayPrice = isSelling
    ? NinaClient.nativeToUiString(
        expectedAmount?.toNumber() || amount,
        release.paymentMint
      )
    : NinaClient.nativeToUiString(amount, release.paymentMint)

  const itemData = (
    <>
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
      <Typography
        className={`${classes.exchangeListItemPrice} ${classes.exchangeListItemPrice}--symbol`}
      >
        1 {symbol}
      </Typography>
      <ExchangeListButton {...props} />
    </>
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
  const classes = useStyles()

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

const useStyles = makeStyles((theme) => ({
  root: {
    maxHeight: '304px',
    height: '100%',
  },
  exchangeList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    padding: '0.2rem 0rem',
    height: '100%',
    overflow: 'scroll',
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  exchangeListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing(0.5, 0)}`,
    borderRadius: '8px',
  },
  exchangeListItemPrice: {
    fontWeight: '700',
    fontSize: '12px',
    color: `${theme.vars.blue}`,
    '&--currentUser': {
      color: `${theme.vars.grey}`,
    },
    '&--usd': {
      color: `${theme.vars.greyLight}`,
    },
    '&--symbol': {
      color: `${theme.vars.black}`,
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
  },
  exchangeListButton: {
    backgroundColor: `${theme.vars.white}`,
    fontSize: `10px`,
    color: `${theme.vars.black}`,
    borderColor: `${theme.vars.black}`,
    padding: `${theme.spacing(0.5, 1)} !important`,
    width: '41px',
    '&:hover': {
      backgroundColor: `${theme.vars.white} !important`,
    },
    '&--Cancel': {
      borderColor: `${theme.vars.grey}`,
      color: `${theme.vars.grey}`,
      backgroundColor: `${theme.vars.white}`,
      '&:hover': {
        borderColor: `${theme.vars.grey}`,
        color: `${theme.vars.grey}`,
      },
    },
  },
  noOffers: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}))

export default ExchangeList
