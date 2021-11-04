import { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import { Card, Box, Button } from '@mui/material'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { Link } from 'react-router-dom'
import Image from 'material-ui-image'
import RedeemableInitialize from './RedeemableInitialize.js'
import RedeemableUpdate from './RedeemableUpdate.js'
import Royalty from './Royalty.js'
import NinaClient from '../utils/client'
import { ReleaseContext } from '../contexts'
import ReactAnimatedEllipsis from 'react-animated-ellipsis';

const ReleaseSettings = (props) => {
  const {
    releasePubkey,
    inCreateFlow,
    tempMetadata,
    artwork,
    redemptionRecords,
    preview
  } = props

  const {
    releaseState,
    redeemableState,
    releaseUpdateMetadata,
    releaseFetchMetadata,
  } = useContext(ReleaseContext)

  const [release, setRelease] = useState(releaseState.tokenData[releasePubkey])
  const [redeemables, setRedeemables] = useState()
  const [metadata, setMetadata] = useState(releaseState.metadata[releasePubkey])
  const [metadataUpdated, setMetadataUpdated] = useState(
    releaseState.metadata[releasePubkey]
  )
  const [displayValues, setDisplayValues] = useState({})

  let timer = undefined

  useEffect(() => {
    if (!metadata) {
      if (!timer) {
        timer = setInterval(() => hasMetadata(releasePubkey), 5000)
      }
    } else {
      clearInterval(timer)
      timer = null
    }
    return () => {
      clearInterval(timer)
      timer = null
    }
  }, [releaseFetchMetadata])

  const hasMetadata = async (releasePubkey) => {
    const metadataTxid = await releaseFetchMetadata(releasePubkey)

    if (metadataTxid) {
      setMetadataUpdated(true)
      clearInterval(timer)
      timer = null
    }
  }

  useEffect(() => {
    if (redeemableState[releasePubkey]) {
      setRedeemables(redeemableState[releasePubkey])
    }
  }, [redeemableState[releasePubkey]])

  useEffect(() => {
    setMetadata(releaseState.metadata[releasePubkey])
  }, [releaseState.metadata[releasePubkey]])

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey])
    }
  }, [releaseState.tokenData[releasePubkey]])

  useEffect(() => {
    if (metadata) {
      setDisplayValues({
        artist: metadata.properties.artist,
        title: metadata.properties.title,
        description: metadata.description,
        catalogNumber: metadata.symbol,
      })
    } else {
      setDisplayValues({
        artist: tempMetadata?.artist,
        title: tempMetadata?.title,
        description: tempMetadata?.description,
        catalogNumber: tempMetadata?.catalogNumber,
      })
    }
  }, [tempMetadata, metadata])

  const handleUpdateMetadataButton = (e) => {
    e.preventDefault()
    releaseUpdateMetadata(releasePubkey)
    // window.open(`https://twitter.com/intent/tweet?text=${`I just released ${metadata?.artist || tempMetadata.artist} - "${metadata?.title || tempMetadata.title}"`}&url=nina.market/release/${releasePubkey}`, null, 'status=no,location=no,toolbar=no,menubar=no,height=500,width=500')
  }


  return (
    <StyledBox>
      <ReleaseInfoWrapper>
        <Typography variant="h6" gutterBottom>
          Confirm Release Info
        </Typography>

       <ReleaseInfo>
        <Typography variant="body2" component="p">
          Edition Size <strong> {release?.totalSupply.toNumber()} {displayValues.catalogNumber} </strong>
        </Typography>

        <Typography variant="body2" component="p">
          Cost <strong>{NinaClient.nativeToUiString(
            release.price.toNumber(),
            release.paymentMint
          )} </strong>
        </Typography>

        <Typography variant="body2" component="p">
            Resale <strong> {release?.resalePercentage.toNumber() / 10000}%</strong>
        </Typography>
        <Typography variant="body2" component="p">
            {displayValues.description}
        </Typography>
       </ReleaseInfo>
   
      {!metadata && (
        <>
          <Typography variant="body1" color="grey.primary">
            {metadataUpdated
              ? 'Your release is ready to be published!'
                : `Your release is currently being uploaded ${< ReactAnimatedEllipsis />}` }
          </Typography>
            {metadataUpdated && (
            <h3>{`Click 'Publish' to make your release live for sale and listening.`}</h3>
          )}
        </>
      )}
          <Box mt={1}>
            <Royalty releasePubkey={releasePubkey} release={release} />
            {metadata ? (
              <Link
                to={`/release/${releasePubkey}`}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="contained" color="primary" fullWidth>
                  View Release
                </Button>
              </Link>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                onClick={(e) => handleUpdateMetadataButton(e)}
                disabled={!metadataUpdated}
                fullWidth
                sx={{marginTop: '15px'}}
              >
                Publish Release
              </Button>
            )}
          </Box>
      </ReleaseInfoWrapper>
    </StyledBox>
  )
}

const StyledBox = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '330px',
}))

const ReleaseInfoWrapper = styled(Box)(() => ({
  width: '100%',
  margin: 'auto',
  textAlign: 'left'
}))

const ReleaseInfo= styled(Box)(({theme}) => ({
  border: `1px solid ${theme.palette.grey.primary}`,
  padding: '20px',
  marginBottom: theme.spacing(1)
}))
export default ReleaseSettings
