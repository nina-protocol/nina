import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import SmoothImage from 'react-smooth-image'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { Typography } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import ninaRecord from '../assets/nina-record.png'
import {Fade} from '@mui/material';
import playCircle from '../assets/playCircle.png'

const { NinaContext, AudioPlayerContext, ExchangeContext, ReleaseContext } =
  ninaCommon.contexts

const ReleaseCard = (props) => {
  const { artwork, metadata, preview, releasePubkey } = props
  const wallet = useWallet()
  const { getAmountHeld, collection } = useContext(NinaContext)
  const { updateTxid } = useContext(AudioPlayerContext)
  const { exchangeState, filterExchangesForReleaseBuySell } =
    useContext(ExchangeContext)
  const { releaseState } = useContext(ReleaseContext)
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
    <StyledReleaseCard>
      <StyledReleaseInfo>
        {track && (
          <Fade in={true}>
            <Button
              onClick={() => {
                updateTxid(track.properties.files[0].uri, releasePubkey)
              }}
              sx={{height: '22px', width: '28px'}}
            >
              <img src={playCircle}/>
            </Button>
          </Fade>
        )}

        {metadata && (
          <Fade in={true}>
            <Typography variant="h6" color="white" align="left">
              {metadata?.properties?.artist || metadata?.artist}, <i>{metadata?.properties?.title || metadata?.title}</i>
            </Typography>         
          </Fade>
        )}

        {wallet?.connected && !preview && (
          <StyledUserAmount>
            <Typography variant="body1">
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
      </StyledReleaseInfo>

      <Box>
        {preview ? (
          <SmoothImage
            src={
              artwork?.meta.status === undefined
                ? ninaRecord
                : artwork.meta.previewUrl
            }
            alt={metadata.artist}
          />
        ) : (
          <>
            {metadata ? (
              <SmoothImage
                src={metadata.image}
                alt={metadata.name}
              />
            ) : (
              <div className="loader--purple">
                <CircularProgress color="inherit" />
              </div>
            )}
          </>
        )}
      </Box>
    </StyledReleaseCard>
  )
}

const StyledReleaseCard = styled(Box)(() => ({
  width: '100%',
  margin: 'auto'
}))

const StyledReleaseInfo = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.blue,
  color: theme.palette.blue,
  height: theme.spacing(5.6),
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(1)
}))

const StyledUserAmount = styled(Box)(({ theme }) => ({
  color: theme.palette.white,
  position: 'absolute',
  top: '0',
  right: theme.spacing(1)
}))



export default ReleaseCard
