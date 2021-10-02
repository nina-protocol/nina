import { useState, useEffect, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Card, Box, Button } from '@material-ui/core'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Link } from 'react-router-dom'
import Image from 'material-ui-image'
import RedeemableInitialize from './RedeemableInitialize.js'
import RedeemableUpdate from './RedeemableUpdate.js'
import Royalty from './Royalty.js'
import ninaCommon from 'nina-common'

const { ReleaseContext } = ninaCommon.contexts
const NinaClient = ninaCommon.utils.NinaClient

const ReleaseSettings = (props) => {
  const {
    releasePubkey,
    inCreateFlow,
    tempMetadata,
    artwork,
    redemptionRecords,
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
  const classes = useStyles()

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
        artist: tempMetadata?.mediaForm.artist,
        title: tempMetadata?.mediaForm.title,
        description: tempMetadata?.mediaForm.description,
        catalogNumber: tempMetadata?.tokenForm.catalogNumber,
      })
    }
  }, [tempMetadata, metadata])

  const handleUpdateMetadataButton = (e) => {
    e.preventDefault()
    releaseUpdateMetadata(releasePubkey)
    // window.open(`https://twitter.com/intent/tweet?text=${`I just released ${metadata?.artist || tempMetadata.artist} - "${metadata?.title || tempMetadata.title}"`}&url=nina.market/release/${releasePubkey}`, null, 'status=no,location=no,toolbar=no,menubar=no,height=500,width=500')
  }

  return (
    <Box className={classes.root} mt={3}>
      <Box
        className={
          inCreateFlow
            ? classes.releaseSettingsWrapper
            : classes.tabSettingsWrapper
        }
      >
        {inCreateFlow && (
          <Box className={classes.leftContainer}>
            <Box className={classes.releaseImageWrapper}>
              <a href={`/release/${releasePubkey}`}>
                {metadata ? (
                  <Image src={metadata.image} />
                ) : (
                  <Image src={artwork.meta.previewUrl} />
                )}
              </a>
            </Box>
          </Box>
        )}

        <Box className={inCreateFlow ? '' : classes.tabInfoWrapper}>
          <Card
            className={inCreateFlow ? classes.card : classes.tabCard}
            variant="outlined"
          >
            <CardContent>
              <>
                <Typography
                  className={classes.title}
                  color="textSecondary"
                  gutterBottom
                >
                  {displayValues.artist} - {displayValues.title}
                </Typography>
                <Typography variant="body2" component="p">
                  <strong>Catalog Number:</strong> {displayValues.catalogNumber}
                </Typography>
              </>

              <Typography variant="body2" component="p">
                <strong>Edition Size:</strong> {release?.totalSupply.toNumber()}
              </Typography>

              <Box className={classes.releaseInfo}>
                <Typography
                  variant="body2"
                  component="p"
                  className={classes.stat}
                >
                  <strong>Price:</strong>{' '}
                  {NinaClient.nativeToUiString(
                    release.price.toNumber(),
                    release.paymentMint
                  )}
                </Typography>

                <Typography
                  variant="body2"
                  component="p"
                  className={classes.stat}
                >
                  <strong>Secondary Sales Percent:</strong>{' '}
                  {release?.resalePercentage.toNumber() / 10000}%
                </Typography>
                {!inCreateFlow && (
                  <>
                    <Typography
                      variant="body2"
                      component="p"
                      className={classes.stat}
                    >
                      <strong>Primary Sales:</strong>{' '}
                      {release.saleCounter.toNumber()} (
                      {NinaClient.nativeToUiString(
                        release.saleTotal.toNumber(),
                        release.paymentMint
                      )}
                      )
                    </Typography>

                    <Typography
                      variant="body2"
                      component="p"
                      className={classes.stat}
                    >
                      <strong>Secondary Sales:</strong>{' '}
                      {release.exchangeSaleCounter.toNumber()} ($
                      {NinaClient.nativeToUiString(
                        release.exchangeSaleTotal.toNumber(),
                        release.paymentMint
                      )}
                      )
                    </Typography>

                    <Typography
                      variant="body2"
                      component="p"
                      className={classes.stat}
                    >
                      <strong>Total Sales:</strong>$
                      {NinaClient.nativeToUiString(
                        release.saleTotal.toNumber() +
                          release.exchangeSaleTotal.toNumber(),
                        release.paymentMint
                      )}
                    </Typography>
                  </>
                )}
              </Box>
              {!metadata && (
                <>
                  <h1>
                    {metadataUpdated
                      ? 'Your release is ready to be published!'
                      : 'Your release is currently being uploaded...'}
                  </h1>
                  {!metadataUpdated && (
                    <>
                      <h3>
                        When it is ready to be listed you can press the publish
                        button below to make it live
                      </h3>
                      <CircularProgress
                        className="default__loader"
                        color="inherit"
                      />
                    </>
                  )}
                  {metadataUpdated && (
                    <h3>{`Click 'Publish' to make your release live for sale and listening.`}</h3>
                  )}
                </>
              )}
              <Box mt={1}>
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
                    variant="contained"
                    color="primary"
                    onClick={(e) => handleUpdateMetadataButton(e)}
                    disabled={!metadataUpdated}
                    fullWidth
                  >
                    Publish Release
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box mt={1} className={inCreateFlow ? classes.ctaWrapper : ''}>
        <h2>Other Actions:</h2>
        <Box>
          <Royalty releasePubkey={releasePubkey} release={release} />
        </Box>
        {redeemables?.length === 0 && (
          <Box mt={1}>
            <RedeemableInitialize
              releasePubkey={releasePubkey}
              amount={releaseState.tokenData[
                releasePubkey
              ]?.totalSupply.toNumber()}
            />
          </Box>
        )}
        {redeemables?.redeemedCount > 0 && (
          <Box mt={1}>
            <RedeemableUpdate
              releasePubkey={releasePubkey}
              redeemables={redeemables}
              redemptionRecords={redemptionRecords}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  releaseSettingsWrapper: {
    justifyContent: 'space-between',
    alignItems: 'center',
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    maxHeight: '50vh',
    width: '90%',
    margin: 'auto',
    marginTop: '0',
  },
  tabSettingsWrapper: {},
  leftContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    marginLeft: '16%',
  },
  releaseImageWrapper: {
    width: '50%',
    margin: 'auto',
  },
  releaseImage: {
    width: '50%',
  },
  tabInfoWrapper: {
    width: '100%',
  },
  card: {
    borderColor: `${theme.vars.purple}`,
    textAlign: 'left',
    width: '50%',
    height: '100%',
    margin: 'auto',
    marginLeft: '10%',
  },
  tabCard: {
    width: '100%',
  },
  mediaLink: {
    width: '33%',
    display: 'flex',
    margin: 'auto',
    '& a': {
      width: '100%',
    },
  },
  media: {
    height: '250px',
    width: '100%',
    backgroundSize: 'contain',
  },
  releaseInfo: {
    // maxWidth: '300px',
    padding: '1rem 0.5rem 0 0',
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.3rem',
  },
  ctaWrapper: {
    width: '30%',
    margin: 'auto',
    marginTop: '0',
  },
}))

export default ReleaseSettings
