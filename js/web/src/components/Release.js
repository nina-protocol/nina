import React, { useState, useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box';
import NinaBox from './NinaBox';
import ReleaseCard from './ReleaseCard'
import ReleaseTabs from './ReleaseTabs'

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
      <StyledNinaBox >
        <ReleaseCard
          metadata={metadata}
          preview={false}
          releasePubkey={releasePubkey}
        />
        <StyleReleaseControls>
          <ReleaseTabs releasePubkey={releasePubkey} />
        </StyleReleaseControls>
      </StyledNinaBox>
  )
}

// const StyledBox = styled(Paper)(({theme}) => ({
//   width: '80vw',
//   margin: 'auto',
//   height: '75vh',
//   gridTemplateColumns: 'repeat(2, 1fr)',
//   backgroundColor: theme.palette.white,
//   border: '2px solid blue'
// }))

const StyleReleaseControls = styled(Box)(() => ({
  margin: 'auto',
  height: '100%',
  width: '80%',
}))

const StyledNinaBox = styled(NinaBox)(() => ({
  border: '10px solid red !important'
}))



export default Release
