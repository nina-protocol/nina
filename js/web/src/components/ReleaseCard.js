import React, { useState, useEffect, useContext } from 'react'
import ninaCommon from 'nina-common'
import SmoothImage from 'react-smooth-image'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import { Typography } from '@material-ui/core'
import { useWallet } from '@solana/wallet-adapter-react'
import ninaRecord from '../assets/nina-record.png'

const { NinaContext, AudioPlayerContext, ExchangeContext, ReleaseContext } =
  ninaCommon.contexts
const { RedeemableModal } = ninaCommon.components

const ReleaseCard = (props) => {
  const { artwork, metadata, preview, releasePubkey } = props
  const classes = useStyles()
  const wallet = useWallet()
  const { getAmountHeld, collection } = useContext(NinaContext)
  const { updateTxid } = useContext(AudioPlayerContext)
  const { exchangeState, filterExchangesForReleaseBuySell } =
    useContext(ExchangeContext)
  const { releaseState, redeemableState } = useContext(ReleaseContext)
  const [amountHeld, setAmountHeld] = useState(collection[releasePubkey])
  const [amountPendingBuys, setAmountPendingBuys] = useState(0)
  const [amountPendingSales, setAmountPendingSales] = useState(0)
  const [track, setTrack] = useState(null)


  useEffect(() => {
    if (!preview) {
      getAmountHeld(releaseState.releaseMintMap[releasePubkey], releasePubkey)
    }
  }, [])

  useEffect(() => {
    setAmountHeld(collection[releasePubkey])
  }, [collection[releasePubkey]])

  useEffect(() => {
    if (!preview) {
      getAmountHeld(releaseState.releaseMintMap[releasePubkey], releasePubkey)
    }
  }, [releasePubkey])

  useEffect(() => {
    setTrack(releaseState.metadata[releasePubkey])
  }, [releaseState.metadata[releasePubkey]])

  useEffect(() => {
    setAmountPendingBuys(
      filterExchangesForReleaseBuySell(releasePubkey, true, true).length
    )
    setAmountPendingSales(
      filterExchangesForReleaseBuySell(releasePubkey, false, true).length
    )
  }, [exchangeState])

  return (
    <div className={classes.releaseCardWrapper}>
      <div className={`${classes.releaseCard}`}>
        <div className={`${classes.releaseCard}__content`}>
          <div className={`${classes.releaseCard}__image`}>
            {preview ? (
              <SmoothImage
                src={
                  artwork?.meta.status === undefined
                    ? ninaRecord
                    : artwork.meta.previewUrl
                }
                className={`${classes.releaseCard}__image`}
                alt={metadata.artist}
              />
            ) : (
              <>
                {metadata ? (
                  <SmoothImage
                    src={metadata.image}
                    className={`${classes.releaseCard}__image`}
                    alt={metadata.name}
                  />
                ) : (
                  <div className="loader--purple">
                    <CircularProgress color="inherit" />
                  </div>
                )}
              </>
            )}
          </div>
          <div className={`${classes.releaseCard}__player`}>
            {track && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  updateTxid(track.properties.files[0].uri, releasePubkey)
                }}
              >
                Play
              </Button>
            )}
          </div>

          <div className={`${classes.releaseCard}__info`}>
            <>
              <div>
                <Typography variant="h6">
                  {metadata?.properties?.artist || metadata?.artist || 'Artist'}
                </Typography>
                <p>
                  {metadata?.properties?.title || metadata?.title || 'Title'}
                </p>
              </div>
            </>
          </div>
          {wallet?.connected && !preview && (
            <>
              <div>
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
              </div>

              {amountHeld > 0 && redeemableState[releasePubkey] && (
                <Box mb={1}>
                  <RedeemableModal
                    releasePubkey={releasePubkey}
                    metadata={metadata}
                  />
                </Box>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const useStyles = makeStyles((theme) => ({
  releaseCardWrapper: {
    height: '100%',
    width: '80%',
  },
  releaseCard: {
    width: '100%',
    height: '100%',
    border: `${theme.vars.borderWidth} solid ${theme.vars.purple}`,
    borderRadius: `${theme.vars.borderRadius}`,
    '&__content': {
      width: '70%',
      margin: 'auto',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    '&__image': {
      width: '100%',
      maxWidth: '38vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '2rem auto',
    },
    '&__player': {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    '&__info': {
      display: 'flex',
      flexDirection: 'column',
      margin: 'auto 0',
      padding: '0',
    },
  },
}))

export default ReleaseCard
