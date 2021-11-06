import { useContext } from 'react'
import { styled } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { NinaContext } from '../contexts'
import ExchangeListItem from './ExchangeListItem'

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
    <Root>
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

const PREFIX = 'ExchangeList'

const classes = {
  exchangeList: `${PREFIX}-exchangeList`,
  noOffers: `${PREFIX}-noOffers`,
}

const Root = styled(Box)(() => ({
  maxHeight: '256px',
  height: '100%',
  display: 'flex',
  justifyContent: '100%',
  alignContent: '100%',
  [`& .${classes.exchangeList}`]: {
    width: '100%',
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    padding: '0.2rem 0rem',
    height: '100%',
    overflow: 'scroll',
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  [`& .${classes.noOffers}`]: {
    margin: 'auto'
  },

}))

export default ExchangeList
