import React, { useState, useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box';
import NinaBox from './NinaBox';
import ReleaseCard from './ReleaseCard'
import ReleasePurchase from './ReleasePurchase'

const { ExchangeContext, ReleaseContext } = ninaCommon.contexts

const Release = ({ match }) => {
  const releasePubkey = match.params.releasePubkey

  const { releaseState, getRelease, getRedeemablesForRelease } =
    useContext(ReleaseContext)
  const { getExchangeHistoryForRelease } = useContext(ExchangeContext)
  const [metadata, setMetadata] = useState(
    releaseState?.metadata[releasePubkey] || null
  )

  useEffect(() => {
    if (!metadata) {
      getRelease(releasePubkey)
    }
    getRedeemablesForRelease(releasePubkey)
    getExchangeHistoryForRelease(releasePubkey)
  }, [])

  useEffect(() => {
    if (releaseState.metadata[releasePubkey]) {
      setMetadata(releaseState.metadata[releasePubkey])
    }
  }, [releaseState?.metadata[releasePubkey]])

  if (metadata && Object.keys(metadata).length === 0) {
    return (
      <div>
        <h1>{`We're still preparing this release for sale, check back soon!`}</h1>
        <Button onClick={() => getRelease(releasePubkey)}>Refresh</Button>
      </div>
    )
  }

  return (
      <NinaBox >
        <ReleaseCard
          metadata={metadata}
          preview={false}
          releasePubkey={releasePubkey}
        />
        <ReleaseCtaWrapper>
          <ReleasePurchase releasePubkey={releasePubkey} metadata={metadata} />
        </ReleaseCtaWrapper>
      </NinaBox>
  )
}

const ReleaseCtaWrapper= styled(Box)(() => ({
  margin: 'auto',
  width: 'calc(100% - 50px)',
  paddingLeft: '50px'
}))

export default Release
