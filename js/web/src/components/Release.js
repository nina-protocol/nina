import React, { useState, useContext, useEffect, useMemo } from 'react'
import SwipeableViews from 'react-swipeable-views'
import { useHistory } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import ninaCommon from 'nina-common'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import NinaBox from './NinaBox'
import ReleaseCard from './ReleaseCard'
import ReleasePurchase from './ReleasePurchase'

const { Dots, Exchange } = ninaCommon.components
const { ExchangeContext, ReleaseContext } = ninaCommon.contexts

const Release = ({ match }) => {
  const releasePubkey = match.params.releasePubkey
  const wallet = useWallet()
  const history = useHistory()
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

  if (!wallet?.connected && match.path.includes('releases')) {
    history.push(`/${releasePubkey}`)
  }

  return (
    <>
      {!metadata && <Dots size="80px" />}
      {metadata && (
        <SwipeableViews index={index}>
          <NinaBox columns={'repeat(2, 1fr)'} sx={{ backgroundColor: 'white' }}>
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
                match={match}
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

const ReleaseCtaWrapper = styled(Box)(({ theme }) => ({
  margin: 'auto',
  width: 'calc(100% - 50px)',
  paddingLeft: '50px',
  [theme.breakpoints.down('md')]: {
    paddingLeft: '0',
    width: '100%',
  },
}))

export default Release
