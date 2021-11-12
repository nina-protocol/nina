import React, { useState, useContext, useEffect, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import NinaBox from './NinaBox'
import ReleaseCard from './ReleaseCard'
import ReleasePurchase from './ReleasePurchase'
import SwipeableViews from 'react-swipeable-views'
const { Dots } = ninaCommon.components

const { Exchange } = ninaCommon.components
const { ExchangeContext, ReleaseContext } = ninaCommon.contexts

const Release = ({ match }) => {
  const releasePubkey = match.params.releasePubkey
  const { releaseState, getRelease } = useContext(ReleaseContext)
  const { getExchangeHistoryForRelease, exchangeState } =
    useContext(ExchangeContext)
  const [track, setTrack] = useState(null)
  const index = useMemo(() => (match.path.includes('market') ? 1 : 0))

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
      {!metadata && <Dots size="80px" />}
      {metadata && (
        <SwipeableViews index={index}>
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
      )}
    </>
  )
}

const ReleaseCtaWrapper = styled(Box)(() => ({
  margin: 'auto',
  width: 'calc(100% - 50px)',
  paddingLeft: '50px',
}))

export default Release
