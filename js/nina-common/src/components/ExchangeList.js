import { useEffect, useState, useContext } from 'react'
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useWallet } from '@solana/wallet-adapter-react'
import { NinaContext } from '../contexts'
import NinaClient from '../utils/client'

const ExchangeList = (props) => {
  let { list, onExchangeButtonAction, release, metadata } = props
  const { solPrice } = useContext(NinaContext)

  if (!list) {
    return (
      <div>
        <CircularProgress color="inherit" />
      </div>
    )
  }

  return (
    <Root className={classes.root}>
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
    </Root>
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
    );
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

const PREFIX = 'ExchangeList';

const classes = {
  root: `${PREFIX}-root`,
  exchangeList: `${PREFIX}-exchangeList`,
  exchangeListItem: `${PREFIX}-exchangeListItem`,
  exchangeListItemPrice: `${PREFIX}-exchangeListItemPrice`,
  exchangeListButton: `${PREFIX}-exchangeListButton`,
  noOffers: `${PREFIX}-noOffers`
};

const Root = styled(Box)((
  {
    theme
  }
) => ({
  maxHeight: '304px',
  height: '100%',
  [`& .${classes.exchangeList}`]: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    padding: '0.2rem 0rem',
    height: '100%',
    overflow: 'scroll',
    overflowX: 'hidden',
    overflowY: 'auto',
  },

  [`& .${classes.exchangeListItem}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing(0.5, 0)}`,
    borderRadius: '8px',
  },

  [`& .${classes.exchangeListItemPrice}`]: {
    fontWeight: '700',
    fontSize: '12px',
    color: `${theme.palette.blue}`,
    '&--currentUser': {
      color: `${theme.palette.grey}`,
    },
    '&--usd': {
      color: `${theme.palette.greyLight}`,
    },
    '&--symbol': {
      color: `${theme.palette.black}`,
      [theme.breakpoints.down('md')]: {
        display: 'none',
      },
    },
  },

  [`& .${classes.exchangeListButton}`]: {
    backgroundColor: `${theme.palette.white}`,
    fontSize: `10px`,
    color: `${theme.palette.black}`,
    borderColor: `${theme.palette.black}`,
    padding: `${theme.spacing(0.5, 1)} !important`,
    width: '41px',
    '&:hover': {
      backgroundColor: `${theme.palette.white} !important`,
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

  [`& .${classes.noOffers}`]: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}));


export default ExchangeList
