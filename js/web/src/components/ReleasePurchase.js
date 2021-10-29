import React, { useEffect, useState, useContext } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { useSnackbar } from 'notistack'
import {Typography} from '@material-ui/core'

const { ReleaseContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

const ReleasePurchase = (props) => {
  const { releasePubkey, metadata } = props
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const { releasePurchase, releasePurchasePending, releaseState, getRelease } =
    useContext(ReleaseContext)
  const [pending, setPending] = useState(undefined)
  const [release, setRelease] = useState(undefined)

  console.log('metadata :>> ', metadata);

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
      >
        Go To Market
      </Button>
    </Box>
  )
}

const AmountRemaining = styled(Typography)(({theme}) => ({
  paddingBottom: '10px',
  '& span': {
   color: theme.palette.blue
 }
}))

export default ReleasePurchase
