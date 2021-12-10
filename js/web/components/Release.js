import React, { useState, useContext, useEffect } from 'react'
import { Helmet } from 'react-helmet'
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
  const {
    releaseState,
    getRelease,
    getRelatedForRelease,
    filterRelatedForRelease,
  } = useContext(ReleaseContext)
  const { getExchangeHistoryForRelease, exchangeState } =
    useContext(ExchangeContext)
  const [track, setTrack] = useState(null)
  const [relatedReleases, setRelatedReleases] = useState(null)

  const [metadata, setMetadata] = useState(
    releaseState?.metadata[releasePubkey] || null
  )

  useEffect(() => {
    getRelatedForRelease(releasePubkey)
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

  useEffect(() => {
    setRelatedReleases(filterRelatedForRelease(releasePubkey))
  }, [releaseState])

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
      {metadata && (
        <Helmet>
          <title>{`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title}`}</title>
          <meta
            name="description"
            content={`${metadata?.properties.artist} - ${metadata?.properties.title}: ${metadata?.description} \n Published on Nina.`}
          />
        </Helmet>
      )}
      {!metadata && <Dots size="80px" />}
      {metadata && (
        <ReleaseWrapper>
          {!match.path.includes('market') && (
            <NinaBox
              columns={'repeat(2, 1fr)'}
              sx={{ backgroundColor: 'white' }}
            >
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
                  relatedReleases={relatedReleases}
                />
              </ReleaseCtaWrapper>
            </NinaBox>
          )}

          {match.path.includes('market') && (
            <NinaBox columns={'repeat(1, 1fr)'}>
              <Exchange
                releasePubkey={releasePubkey}
                exchanges={exchangeState.exchanges}
                metadata={metadata}
                track={track}
              />
            </NinaBox>
          )}
        </ReleaseWrapper>
      )}
    </>
  )
}

const ReleaseWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    overflowX: 'scroll',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
}))
const ReleaseCtaWrapper = styled(Box)(({ theme }) => ({
  margin: 'auto',
  width: 'calc(100% - 50px)',
  paddingLeft: '50px',
  [theme.breakpoints.down('md')]: {
    paddingLeft: '0',
    width: '100%',
    marginBottom: '100px',
  },
}))

export default Release
