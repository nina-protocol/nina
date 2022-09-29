import React, { useState, useContext, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import Exchange from '@nina-protocol/nina-internal-sdk/esm/Exchange'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'
import NinaBox from './NinaBox'
import ReleaseCard from './ReleaseCard'
import ReleasePurchase from './ReleasePurchase'
import ExchangeComponent from './Exchange'
const ReleaseComponent = ({ metadataSsr }) => {
  const router = useRouter()
  const releasePubkey = router.query.releasePubkey

  const wallet = useWallet()
  const {
    releaseState,
    getRelease,
    getRelatedForRelease,
    filterRelatedForRelease,
  } = useContext(Release.Context)
  const { getExchangeHistoryForRelease, exchangeState } =
    useContext(Exchange.Context)
  const { getHubsForUser, filterHubsForUser, hubState } = useContext(Hub.Context)
  const [relatedReleases, setRelatedReleases] = useState(null)
  const [userHubs, setUserHubs] = useState()

  const [metadata, setMetadata] = useState(
    metadataSsr || releaseState?.metadata[releasePubkey] || null
  )
    console.log('releaseState', releaseState)
  useEffect(() => {
    if (releasePubkey) {
      getRelatedForRelease(releasePubkey)
      getExchangeHistoryForRelease(releasePubkey)
    }
  }, [releasePubkey])

  useEffect(() => {
    if (releaseState.metadata[releasePubkey] && !metadata) {
      setMetadata(releaseState.metadata[releasePubkey])
    }
  }, [releaseState?.metadata[releasePubkey]])

  useEffect(() => {
    setRelatedReleases(filterRelatedForRelease(releasePubkey))
  }, [releaseState])

  useEffect(() => {
    if (wallet.connected) {
      getHubsForUser(wallet.publicKey.toBase58())
    }
  }, [wallet.connect])

  useEffect(() => {
    if (wallet.connected) {
      getHubsForUser(wallet.publicKey.toBase58())
    }
  }, [])

  useEffect(() => {
    if (wallet.connected && hubState) {
      setUserHubs(filterHubsForUser(wallet.publicKey.toBase58()))
    }
  }, [hubState])

  useEffect(() => {
    setUserHubs(null)
  }, [wallet?.disconnecting])

  if (metadata && Object.keys(metadata).length === 0) {
    return (
      <div>
        <h1>{`We're still preparing this release for sale, check back soon!`}</h1>
        <Button onClick={() => getRelease(releasePubkey)}>Refresh</Button>
      </div>
    )
  }

  if (!wallet?.connected && router.pathname.includes('releases')) {
    router.push(`/${releasePubkey}`)
  }

  return (
    <>
      <ReleaseWrapper>
        {!router.pathname.includes('market') && (
          <NinaBox columns={'repeat(2, 1fr)'} sx={{ backgroundColor: 'white' }}>
            <ReleaseCard
              metadata={metadata}
              preview={false}
              releasePubkey={releasePubkey}
              userHubs={userHubs}
          
            />
            <ReleaseCtaWrapper>
              <ReleasePurchase
                releasePubkey={releasePubkey}
                metadata={metadata}
                router={router}
                relatedReleases={relatedReleases}
              />
            </ReleaseCtaWrapper>
          </NinaBox>
        )}

        {router.pathname.includes('market') && (
          <NinaBox columns={'repeat(1, 1fr)'}>
            <ExchangeComponent
              releasePubkey={releasePubkey}
              exchanges={exchangeState.exchanges}
              metadata={metadata}
            />
          </NinaBox>
        )}
      </ReleaseWrapper>
    </>
  )
}

const ReleaseWrapper = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  [theme.breakpoints.down('md')]: {
    display: 'block',
    overflowX: 'scroll',
    padding: '100px 0 160px',
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
  },
}))

export default ReleaseComponent
