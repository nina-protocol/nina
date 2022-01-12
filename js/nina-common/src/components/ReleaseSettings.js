import { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import { Box, Button } from '@mui/material'
import Typography from '@mui/material/Typography'
<<<<<<< HEAD
import Link from 'next/link'
=======
import { Link } from 'react-router-dom'
>>>>>>> 50df02d28f74f80815ea62ba7066cc757242a5b8

import Royalty from './Royalty.js'
import NinaClient from '../utils/client'
import { ReleaseContext } from '../contexts'

const ReleaseSettings = (props) => {
  const { releasePubkey, tempMetadata, inCreateFlow } = props

<<<<<<< HEAD
  const { releaseState, releaseFetchStatus } = useContext(ReleaseContext)
=======
  const { releaseState, releaseFetchMetadata } = useContext(ReleaseContext)
>>>>>>> 50df02d28f74f80815ea62ba7066cc757242a5b8

  const [release, setRelease] = useState(releaseState.tokenData[releasePubkey])
  const [metadata, setMetadata] = useState(releaseState.metadata[releasePubkey])
  const [displayValues, setDisplayValues] = useState({})
<<<<<<< HEAD
  const [uploadStatus, setUploadStatus] = useState({
    status: "pending",
    reason: "image",
  })
=======

>>>>>>> 50df02d28f74f80815ea62ba7066cc757242a5b8
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
<<<<<<< HEAD
  }, [releaseFetchStatus])

  const hasMetadata = async (releasePubkey) => {
    const result = await releaseFetchStatus(releasePubkey)
    console.log(result)
    setUploadStatus(result)
    if (result.status === "success") {
=======
  }, [releaseFetchMetadata])

  const hasMetadata = async (releasePubkey) => {
    const metadataTxid = await releaseFetchMetadata(releasePubkey)

    if (metadataTxid) {
>>>>>>> 50df02d28f74f80815ea62ba7066cc757242a5b8
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
        {inCreateFlow && (
          <Typography variant="h4" gutterBottom>
            Confirm Release Info
          </Typography>
        )}
        <ReleaseInfo className={inCreateFlow ? 'inCreateFlow' : ''}>
          <ReleaseStat variant="body1" component="p">
            <ReleaseStatLeft variant="subtitle1">Catalog No.</ReleaseStatLeft>
            <ReleaseStatRight variant="subtitle1">
              {' '}
              {displayValues.catalogNumber}{' '}
            </ReleaseStatRight>
          </ReleaseStat>

          <ReleaseStat variant="body1" component="p">
            <ReleaseStatLeft variant="subtitle1">Amount</ReleaseStatLeft>
            <ReleaseStatRight variant="subtitle1">
              {release?.totalSupply.toNumber()}
            </ReleaseStatRight>
          </ReleaseStat>

          <ReleaseStat variant="body1" component="p">
            <ReleaseStatLeft variant="subtitle1">Cost USD</ReleaseStatLeft>
            <ReleaseStatRight variant="subtitle1">
              {NinaClient.nativeToUiString(
                release?.price.toNumber(),
                release?.paymentMint,
                false,
                false
              )}
            </ReleaseStatRight>
          </ReleaseStat>

          <ReleaseStat variant="body1" component="p">
            <ReleaseStatLeft variant="subtitle1">Resale %</ReleaseStatLeft>
            <ReleaseStatRight variant="subtitle1">
              {' '}
              {release?.resalePercentage.toNumber() / 10000}%
            </ReleaseStatRight>
          </ReleaseStat>
          {!inCreateFlow && (
            <>
              <ReleaseStat variant="body1" component="p">
                <ReleaseStatLeft variant="subtitle1">
                  Primary Sales
                </ReleaseStatLeft>
                <ReleaseStatRight variant="subtitle1">
                  {release?.saleCounter.toNumber()}
                </ReleaseStatRight>
              </ReleaseStat>
              <ReleaseStat variant="body1" component="p">
                <ReleaseStatLeft variant="subtitle1">
                  Secondary Sales
                </ReleaseStatLeft>
                <ReleaseStatRight variant="subtitle1">
                  {release?.exchangeSaleCounter.toNumber()}
                </ReleaseStatRight>
              </ReleaseStat>
              <ReleaseStat variant="body1" component="p">
                <ReleaseStatLeft variant="subtitle1">
                  Total Earnings
                </ReleaseStatLeft>
                <ReleaseStatRight variant="subtitle1">
                  {NinaClient.nativeToUiString(
                    release?.totalCollected.toNumber(),
                    release?.paymentMint
                  )}
                </ReleaseStatRight>
              </ReleaseStat>
            </>
          )}
          {inCreateFlow && (
            <Typography
              variant="body1"
              component="p"
              sx={{ marginTop: '10px !important' }}
            >
              {displayValues.description}
            </Typography>
          )}
        </ReleaseInfo>

        <Box mt={1}>
          <Royalty releasePubkey={releasePubkey} release={release} />

          <Button
            variant="outlined"
            fullWidth
            sx={{ marginTop: '15px !important' }}
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?text=${`${displayValues.artist} - "${displayValues.title}" on Nina%0A`}&url=nina.market/${releasePubkey}`,
                null,
                'status=no,location=no,toolbar=no,menubar=no,height=500,width=500'
              )
            }
          >
            <Typography variant="body2">Share to Twitter</Typography>
          </Button>

<<<<<<< HEAD
=======
          <Link to={`/${releasePubkey}`} style={{ textDecoration: 'none' }}>
>>>>>>> 50df02d28f74f80815ea62ba7066cc757242a5b8
            {inCreateFlow && (
              <Button
                variant="outlined"
                color="primary"
                fullWidth
<<<<<<< HEAD
                disabled={uploadStatus.status === "pending" || uploadStatus.status === "failed"}
                sx={{ marginTop: '10px !important' }}
              >
                <Link href={`/${releasePubkey}`} style={{ textDecoration: 'none' }}>
                  <Typography variant="body2">
                    {uploadStatus.status === "pending" &&
                      `Your release is currently being finalized - processing (${uploadStatus.reason})...`
                    }
                    {uploadStatus.status === "success" &&
                      'View Release'
                    }
                    {uploadStatus.status === "failed" &&
                      'Failed - send again'
                    }
                  </Typography>
                </Link>
              </Button>
            )}
=======
                disabled={!metadata}
                sx={{ marginTop: '10px !important' }}
              >
                <Typography variant="body2">
                  {metadata
                    ? 'View Release'
                    : 'Your release is currently being finalized...'}
                </Typography>
              </Button>
            )}
          </Link>
>>>>>>> 50df02d28f74f80815ea62ba7066cc757242a5b8
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
  },
}))

const ReleaseStatRight = styled(Typography)(() => ({
  fontWeight: 'bold',
}))

const ReleaseStatLeft = styled(Typography)(() => ({
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
