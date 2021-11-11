import React, { useState, useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import NinaBox from './NinaBox'
import ReleaseCard from './ReleaseCard'
import ReleasePurchase from './ReleasePurchase'
import SwipeableViews from 'react-swipeable-views'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'

const { Exchange, Dots } = ninaCommon.components
const { ExchangeContext, ReleaseContext } = ninaCommon.contexts

const Release = ({ match }) => {
  const releasePubkey = match.params.releasePubkey
  const { releaseState, getRelease } = useContext(ReleaseContext)
  const { getExchangeHistoryForRelease, exchangeState } =
    useContext(ExchangeContext)
  const [track, setTrack] = useState(null)
  const [index, setIndex] = useState()

  const [metadata, setMetadata] = useState(
    releaseState?.metadata[releasePubkey] || null
  )

  useEffect(() => {
    if (!metadata) {
      getRelease(releasePubkey)
    }
    getExchangeHistoryForRelease(releasePubkey)
  }, [])

  useEffect(() => {
    if (releaseState.metadata[releasePubkey]) {
      setMetadata(releaseState.metadata[releasePubkey])
    }
  }, [releaseState?.metadata[releasePubkey]])

  useEffect(() => {
    setTrack(releaseState.metadata[releasePubkey])
  }, [releaseState.metadata[releasePubkey]])

  const handleChangeIndex = (value) => {
    setIndex(value)
  }

  if (metadata && Object.keys(metadata).length === 0) {
    return (
      <div>
        <h1>{`We're still preparing this release for sale, check back soon!`}</h1>
        <Button onClick={() => getRelease(releasePubkey)}>Refresh</Button>
      </div>
    )
  }

  return (
    <>
      {index === 1 && (
        <StyledArrowBackIosIcon fontSize="large" onClick={() => setIndex(0)} />
      )}
      {!metadata && (
        <Dots size="80px" />
      )

      }
      {metadata && 
        <SwipeableViews index={index} onChangeIndex={handleChangeIndex}>
          <NinaBox columns={'repeat(2, 1fr)'}>
            <ReleaseCard
              metadata={metadata}
              preview={false}
              releasePubkey={releasePubkey}
              track={track}
            />

            <ReleaseCtaWrapper>
              <ReleasePurchase
                releasePubkey={releasePubkey}
                metadata={metadata}
                setIndex={setIndex}
              />
            </ReleaseCtaWrapper>
          </NinaBox>

          <NinaBox columns={'repeat(1, 1fr)'}>
            <Exchange
              releasePubkey={releasePubkey}
              exchanges={exchangeState.exchanges}
              metadata={metadata}
              track={track}
            />
          </NinaBox>
        </SwipeableViews>
      }
    </>
  )
}

const ReleaseCtaWrapper = styled(Box)(() => ({
  margin: 'auto',
  width: 'calc(100% - 50px)',
  paddingLeft: '50px',
}))

const StyledArrowBackIosIcon = styled(ArrowBackIosIcon)(({ theme }) => ({
  position: 'absolute',
  left: theme.spacing(1),
  top: theme.spacing(6),
  cursor: 'pointer',
}))

export default Release
