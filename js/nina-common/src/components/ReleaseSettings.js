import { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import { Box, Button } from '@mui/material'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'

import Royalty from './Royalty.js'
import NinaClient from '../utils/client'
import { ReleaseContext } from '../contexts'

const ReleaseSettings = (props) => {
  const { releasePubkey, tempMetadata, inCreateFlow } = props

  const { releaseState, releaseFetchMetadata } = useContext(ReleaseContext)

  const [release, setRelease] = useState(releaseState.tokenData[releasePubkey])
  const [metadata, setMetadata] = useState(releaseState.metadata[releasePubkey])
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
      clearInterval(timer)
      timer = null
    }
  }

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

return (
    <StyledBox>
      <ReleaseInfoWrapper>
        {inCreateFlow &&
          <Typography variant="h4" gutterBottom>
            Confirm Release Info
          </Typography>
        }
        <ReleaseInfo className={inCreateFlow ? "inCreateFlow" : ""}>
          <ReleaseStat variant="body1" component="p">
            <ReleaseStatLeft variant="subtitle1">Catalog No.</ReleaseStatLeft> 
            <ReleaseStatRight variant="subtitle1"> {displayValues.catalogNumber} </ReleaseStatRight>
          </ReleaseStat>

          <ReleaseStat variant="body1" component="p">
            <ReleaseStatLeft variant="subtitle1">Amount</ReleaseStatLeft> 
            <ReleaseStatRight variant="subtitle1">{release?.totalSupply.toNumber()}</ReleaseStatRight>
          </ReleaseStat>

          <ReleaseStat variant="body1" component="p">
            <ReleaseStatLeft variant="subtitle1">Cost USD</ReleaseStatLeft>
            <ReleaseStatRight variant="subtitle1">{NinaClient.nativeToUiString(
              release.price.toNumber(),
              release.paymentMint,
              false,
              false
            )}</ReleaseStatRight>
          </ReleaseStat>

          <ReleaseStat variant="body1" component="p">
            <ReleaseStatLeft variant="subtitle1">Resale %</ReleaseStatLeft>
            <ReleaseStatRight variant="subtitle1"> {release?.resalePercentage.toNumber() / 10000}%</ReleaseStatRight>
          </ReleaseStat>
          {!inCreateFlow &&
            <>
            <ReleaseStat variant="body1" component="p">
              <ReleaseStatLeft variant="subtitle1">Primary Sales</ReleaseStatLeft>
               <ReleaseStatRight variant="subtitle1">{release.saleCounter.toNumber()}</ReleaseStatRight>
            </ReleaseStat>
            <ReleaseStat variant="body1" component="p">
              <ReleaseStatLeft variant="subtitle1">Secondary Sales</ReleaseStatLeft>
               <ReleaseStatRight variant="subtitle1">{release.exchangeSaleCounter.toNumber()}</ReleaseStatRight>
            </ReleaseStat>
            <ReleaseStat variant="body1" component="p">
              <ReleaseStatLeft variant="subtitle1">Total Earnings</ReleaseStatLeft>
               <ReleaseStatRight variant="subtitle1">{NinaClient.nativeToUiString(
                release.totalCollected.toNumber(),
                release.paymentMint,
              )}</ReleaseStatRight>
            </ReleaseStat>
            </>
          }
          {inCreateFlow &&
            <Typography
              variant="body1"
              component="p"
              sx={{ marginTop: '10px !important' }}
            >
              {displayValues.description}
            </Typography>
          }
        </ReleaseInfo>

        <Box mt={1}>
          <Royalty releasePubkey={releasePubkey} release={release} />
          <Link
            to={releasePubkey}
            style={{ textDecoration: 'none' }}
          >
          {inCreateFlow &&
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              disabled={!metadata}
              sx={{marginTop: '10px !important'}}
            >
              <Typography variant="body2">
                {metadata
                  ? 'View Release'
                  : 'Your release is currently being finalized...'}
                </Typography>
            </Button>
          }
          </Link>
        </Box>
      </ReleaseInfoWrapper>
    </StyledBox>
  )
}

const StyledBox = styled(Box)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '330px',
}))

const ReleaseInfoWrapper = styled(Box)(() => ({
  width: '100%',
  margin: 'auto',
  textAlign: 'left',
}))

const ReleaseInfo = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  paddingTop: '20px',
  '& .inCreateFlow': {
    border: `1px solid ${theme.palette.grey.primary}`,
    padding: '20px',
  }
}))

const ReleaseStatRight = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
}))

const ReleaseStatLeft = styled(Typography)(({ theme }) => ({
  width: '140px',
}))


const ReleaseStat = styled(Typography)(() => ({
  display: 'flex',
  '& span': {
    width: '75px',
  },
  '& strong': {
    paddingLeft: '15px',
  },
}))
export default ReleaseSettings
