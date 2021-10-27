import React, { useEffect, useState, useContext } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { useSnackbar } from 'notistack'
import SquareModal from './SquareModal'

const { ReleaseContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

const ReleasePurchase = (props) => {
  const { releasePubkey } = props

  const theme = useTheme()
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const { releasePurchase, releasePurchasePending, releaseState, getRelease } =
    useContext(ReleaseContext)
  const [pending, setPending] = useState(undefined)
  const [release, setRelease] = useState(undefined)

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
      <Root>
        <CircularProgress color="inherit" />
      </Root>
    )
  }

  const buttonText =
    release.remainingSupply > 0
      ? `Buy ${NinaClient.nativeToUiString(
          release.price.toNumber(),
          release.paymentMint
        )}`
      : 'Sold Out'

  const buttonDisabled =
    wallet?.connected && release.remainingSupply > 0 ? false : true

  return (
    <div className={classes.releasePurchase}>
      <form
        className={`${classes.releasePurchase}__form`}
        style={theme.helpers.flexColumn}
        onSubmit={handleSubmit}
      >
        <p>
          {release.remainingSupply.toNumber()} /{' '}
          {release.totalSupply.toNumber()} available
        </p>
        <Box mt={3} className={classes.releasePurchaseCtaWrapper}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={buttonDisabled}
          >
            {pending ? (
              <CircularProgress className="default__loader" color="inherit" />
            ) : (
              buttonText
            )}
          </Button>
          {NinaClient.isUsdc(release.paymentMint) && (
            <SquareModal
              buttonDisabled={buttonDisabled}
              releasePubkey={releasePubkey}
              release={release}
            />
          )}
        </Box>
      </form>
    </div>
  )
}

const PREFIX = 'ReleasePurchase'

const classes = {
  releasePurchase: `${PREFIX}-releasePurchase`,
  releasePurchaseCtaWrapper: `${PREFIX}-releasePurchaseCtaWrapper`,
}

const Root = styled('div')(() => ({
  [`& .${classes.releasePurchase}`]: {
    height: '100%',
    '&__form': {
      height: '90%',
    },
  },

  [`& .${classes.releasePurchaseCtaWrapper}`]: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-evenly',
  },
}))

export default ReleasePurchase
