import React, { useEffect, useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useSnackbar } from 'notistack'
import { Typography } from '@mui/material'

const { Dots, ReleaseSettings } = ninaCommon.components
const { ReleaseContext, NinaContext, ExchangeContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

const ReleasePurchase = (props) => {
  const { releasePubkey, metadata, match } = props
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const history = useHistory()
  const { releasePurchase, releasePurchasePending, releaseState, getRelease } =
    useContext(ReleaseContext)
  const { getAmountHeld, collection } = useContext(NinaContext)
  const { exchangeState, filterExchangesForReleaseBuySell } =
    useContext(ExchangeContext)
  const [pending, setPending] = useState(undefined)
  const [release, setRelease] = useState(undefined)
  const [amountHeld, setAmountHeld] = useState(collection[releasePubkey])
  const [amountPendingBuys, setAmountPendingBuys] = useState(0)
  const [amountPendingSales, setAmountPendingSales] = useState(0)

  useEffect(() => {
    getRelease(releasePubkey)
  }, [releasePubkey])

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey])
    }
  }, [releaseState.tokenData[releasePubkey]])

  useEffect(() => {
    setPending(releasePurchasePending[releasePubkey])
  }, [releasePurchasePending[releasePubkey]])

  useEffect(() => {
    getAmountHeld(releaseState.releaseMintMap[releasePubkey], releasePubkey)
  }, [])

  useEffect(() => {
    setAmountHeld(collection[releasePubkey])
  }, [collection[releasePubkey]])

  useEffect(() => {
    getAmountHeld(releaseState.releaseMintMap[releasePubkey], releasePubkey)
  }, [releasePubkey])

  useEffect(() => {
    setAmountPendingBuys(
      filterExchangesForReleaseBuySell(releasePubkey, true, true).length
    )
    setAmountPendingSales(
      filterExchangesForReleaseBuySell(releasePubkey, false, true).length
    )
  }, [exchangeState])

  const handleSubmit = async (e) => {
    e.preventDefault()
    let result

    if (!release.pending) {
      enqueueSnackbar('Making transaction...', {
        variant: 'info',
      })
      result = await releasePurchase(releasePubkey)
      if (result) {
        showCompletedTransaction(result)
      }
    }
  }

  const showCompletedTransaction = (result) => {
    enqueueSnackbar(result.msg, {
      variant: result.success ? 'success' : 'warn',
    })
  }

  if (!release) {
    return (
      <>
        <Dots color="inherit" />
      </>
    )
  }

  const buttonText =
    release.remainingSupply > 0
      ? `Buy $${NinaClient.nativeToUiString(
          release.price.toNumber(),
          release.paymentMint
        )}`
      : 'Sold Out'

  const buttonDisabled =
    wallet?.connected && release.remainingSupply > 0 ? false : true

  let pathString = ''
  if (match.path.includes('releases')) {
    pathString = '/releases'
  } else if (match.path.includes('collection')) {
    pathString = '/collection'
  }

  return (
    <Box>
      <AmountRemaining variant="body2" align="left">
        Remaining <span>{release.remainingSupply.toNumber()} </span> /{' '}
        {release.totalSupply.toNumber()}
      </AmountRemaining>

      {wallet?.connected && (
        <StyledUserAmount>
          <Typography variant="body1" align="left">
            {metadata && (
              <>
                You have: {amountHeld || 0} {metadata.symbol}
              </>
            )}
            {amountPendingSales > 0 ? (
              <>
                {amountPendingSales} pending sale
                {amountPendingSales > 1 ? 's' : ''}{' '}
              </>
            ) : null}
            {amountPendingBuys > 0 ? (
              <>
                {amountPendingBuys} pending buy
                {amountPendingBuys > 1 ? 's' : ''}{' '}
              </>
            ) : null}
          </Typography>
        </StyledUserAmount>
      )}
      <Typography variant="h3" align="left">
        {metadata.description}
      </Typography>
      {wallet?.connected &&
        wallet.publicKey.toBase58() === release.authority.toBase58() && (
          <ReleaseSettings releasePubkey={releasePubkey} inCreateFlow={false} />
        )}
      <Box mt={1}>
        <form onSubmit={handleSubmit}>
          <Button
            variant="outlined"
            type="submit"
            disabled={buttonDisabled}
            fullWidth
          >
            <Typography variant="body2">
              {pending ? <Dots msg="awaiting wallet approval" /> : buttonText}
            </Typography>
          </Button>
        </form>
      </Box>
      <MarketButton
        variant="outlined"
        fullWidth
        onClick={() => {
          history.push(
            `${pathString}/${releasePubkey}/market`
          )
        }}
      >
        <Typography variant="body2">Go To Market</Typography>
      </MarketButton>
    </Box>
  )
}

const AmountRemaining = styled(Typography)(({ theme }) => ({
  paddingBottom: '10px',
  '& span': {
    color: theme.palette.blue,
  },
}))

const StyledUserAmount = styled(Box)(({ theme }) => ({
  color: theme.palette.black,
  ...theme.helpers.baseFont,
  paddingBottom: '10px',
}))

const MarketButton = styled(Button)(({ theme }) => ({
  marginTop: `${theme.spacing(1)} !important`,
  [theme.breakpoints.down('md')]: {
    display: 'none !important',
  },
}))

export default ReleasePurchase
