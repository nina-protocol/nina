import React, { useEffect, useState, useContext } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { useSnackbar } from 'notistack'
import {Typography} from '@material-ui/core'

const { ReleaseContext, NinaContext, ExchangeContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

const ReleasePurchase = (props) => {
  const { releasePubkey, metadata, setIndex } = props
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const { releasePurchase, releasePurchasePending, releaseState, getRelease } =
    useContext(ReleaseContext)
  const { getAmountHeld, collection } = useContext(NinaContext)
  const {exchangeState, filterExchangesForReleaseBuySell} =
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


  const handleSubmit = (e) => {
    e.preventDefault()
    if (!release.pending) {
      enqueueSnackbar('Making transaction...', {
        variant: 'info',
      })
      releasePurchase(releasePubkey)
    }
  }

  if (!release) {
    return (
      <>
        <CircularProgress color="inherit" />
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

  return (
    <Box>
      <AmountRemaining align="left">
        Remaining <span>{release.remainingSupply.toNumber()} </span> /{' '}
        {release.totalSupply.toNumber()} 
      </AmountRemaining>

      {wallet?.connected && (
        <StyledUserAmount>
          <Typography variant="body1" align="left">
            {metadata && (
              <p>
                You have: {amountHeld || 0} {metadata.symbol}
              </p>
            )}
            {amountPendingSales > 0 ? (
              <p>
                {amountPendingSales} pending sale
                {amountPendingSales > 1 ? 's' : ''}{' '}
              </p>
            ) : null}
            {amountPendingBuys > 0 ? (
              <p>
                {amountPendingBuys} pending buy
                {amountPendingBuys > 1 ? 's' : ''}{' '}
              </p>
            ) : null}
          </Typography>
        </StyledUserAmount>
      )}
      <Typography align="left">
        {metadata.description}
      </Typography>
      <Box mt={3}>
        <form
          onSubmit={handleSubmit}
        >
          <Button
            variant="outlined"
            type="submit"
            disabled={buttonDisabled}
            fullWidth
          >
            {pending ? (
              <CircularProgress size="15px"  color="inherit" />
            ) : (
              buttonText
            )}
          </Button>
        </form>
      </Box>

      <Button
        variant="outlined"
        fullWidth
        onClick={() => setIndex(1)}
        sx={{
          marginTop: 15
        }}
      >
        Go To Market
      </Button>
    </Box>
  )
}

const AmountRemaining = styled(Typography)(({theme}) => ({
  // paddingBottom: '10px',
  '& span': {
   color: theme.palette.blue
 }
}))

const StyledUserAmount = styled(Box)(({theme}) => ({
  color: theme.palette.black,
}))

export default ReleasePurchase
