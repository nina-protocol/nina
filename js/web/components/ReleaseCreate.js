import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import * as Yup from 'yup'
import nina from '@nina-protocol/nina-sdk'
import {useSnackbar} from 'notistack'
import {styled} from '@mui/material/styles'
import Button from '@mui/material/Button'
import dynamic from 'next/dynamic'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import {useWallet} from '@solana/wallet-adapter-react'
import {useRouter} from 'next/router'
import ReleaseCreateForm from './ReleaseCreateForm'
import ReleaseCreateConfirm from './ReleaseCreateConfirm'
import NinaBox from './NinaBox'
import MediaDropzones from './MediaDropzones'
import UploadInfoModal from './UploadInfoModal'
import Dots from './Dots'
import Grid from '@mui/material/Grid'
import Link from 'next/link'
import {
  createUpload,
  updateUpload,
  removeUpload,
  UploadType,
  uploadHasItemForType,
} from '../utils/uploadManager'
const BundlrModal = dynamic(() => import('./BundlrModal'))
const {ReleaseContext, NinaContext, HubContext} = nina.contexts

const ReleaseCreateSchema = Yup.object().shape({
  artist: Yup.string().required('Artist is Required'),
  title: Yup.string().required('Title is Required'),
  description: Yup.string().required('Description is Required'),
  catalogNumber: Yup.string().required('Catalog Number is Required'),
  amount: Yup.number().required('Edition Size is Required'),
  retailPrice: Yup.number().required('Price is Required'),
  resalePercentage: Yup.number().required('Resale Percent Amount is Required'),
})

const ReleaseCreate = () => {
  const {enqueueSnackbar} = useSnackbar()
  const wallet = useWallet()
  const {
    releaseState,
    initializeReleaseAndMint,
    releaseCreateMetadataJson,
    releaseCreate
  } = useContext(ReleaseContext)
  const {hubState} = useContext(HubContext)
  const router = useRouter()
  const {
    bundlrUpload,
    bundlrBalance,
    getBundlrBalance,
    getBundlrPricePerMb,
    bundlrPricePerMb,
    solPrice,
    getSolPrice,
    getNpcAmountHeld, 
    npcAmountHeld
  } = useContext(NinaContext)

  const [track, setTrack] = useState(undefined)
  const [artwork, setArtwork] = useState()
  const [uploadSize, setUploadSize] = useState()
  const [releasePubkey, setReleasePubkey] = useState(undefined)
  const [release, setRelease] = useState(undefined)
  const [buttonText, setButtonText] = useState('Publish Release')
  const [pending, setPending] = useState(false)
  const [formIsValid, setFormIsValid] = useState(false)
  const [formValues, setFormValues] = useState({
    releaseForm: {},
  })
  const [imageProgress, setImageProgress] = useState()
  const [audioProgress, setAudioProgress] = useState()
  const [formValuesConfirmed, setFormValuesConfirmed] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [releaseInfo, setReleaseInfo] = useState()
  const [artworkTx, setArtworkTx] = useState()
  const [trackTx, setTrackTx] = useState()
  const [metadata, setMetadata] = useState()
  const [metadataTx, setMetadataTx] = useState()
  const [releaseCreated, setReleaseCreated] = useState(false)
  const [uploadId, setUploadId] = useState()
  const [publishingStepText, setPublishingStepText] = useState()

  const mbs = useMemo(
    () => bundlrBalance / bundlrPricePerMb,
    [bundlrBalance, bundlrPricePerMb]
  )
  const bundlrUsdBalance = useMemo(
    () => bundlrBalance * solPrice,
    [bundlrBalance, solPrice]
  )

  const refreshBundlr = () => {
    getBundlrPricePerMb()
    getBundlrBalance()
    getSolPrice()
  }

  useEffect(async () => {
    getNpcAmountHeld();
  }, [wallet?.connected]);
  


  useEffect(() => {
    if (isPublishing) {
      if (!artworkTx) {
        setPublishingStepText(
          '1/4 Uploading Artwork.  Please confirm in wallet and do not close this window.'
        )
      } else if (!trackTx) {
        setPublishingStepText(
          '2/4 Uploading Track.  Please confirm in wallet and do not close this window.  This may take a while.'
        )
      } else if (!metadataTx) {
        setPublishingStepText(
          '3/4 Uploading Metadata.  Please confirm in wallet and do not close this window.'
        )
      } else {
        setPublishingStepText(
          '4/4 Finalizing Release.  Please confirm in wallet and do not close this window.'
        )
      }
    } else {
      if (releaseCreated) {
        setButtonText('Release Created!  View Release.')
      } else if (artworkTx && !trackTx) {
        setButtonText('Restart 2/4: Upload Track.')
      } else if (artworkTx && trackTx && !metadataTx) {
        setButtonText('Restart 3/4: Upload Metadata.')
      } else if (artworkTx && trackTx && metadataTx && !releaseCreated) {
        setButtonText('Restart 4/4: Finalize Release')
      } else if (mbs < uploadSize) {
        setButtonText(
          `Release requires more storage than available in your bundlr account, please top up`
        )
      }
    }
  }, [
    artworkTx,
    metadataTx,
    trackTx,
    isPublishing,
    releaseCreated,
    bundlrBalance,
  ])

  useEffect(() => {
    if (releasePubkey && releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey])
    }
  }, [releaseState.tokenData[releasePubkey]])

  const handleFormChange = useCallback(
    async (values) => {
      setFormValues({
        ...formValues,
        releaseForm: values,
      })
    },
    [formValues]
  )

  useEffect(() => {
    if (track && artwork) {
      const valid = async () => {
        const isValid = await ReleaseCreateSchema.isValid(
          formValues.releaseForm,
          {
            abortEarly: true,
          }
        )
        setFormIsValid(isValid)
      }
      valid()
    } else {
      setFormIsValid(false)
    }
  }, [formValues, track, artwork])

  useEffect(() => {
    const trackSize = track ? track.meta.size / 1000000 : 0
    const artworkSize = artwork ? artwork.meta.size / 1000000 : 0
    setUploadSize((trackSize + artworkSize).toFixed(2))
  }, [track, artwork])

  

  const handleSubmit = async () => {
    try {
      if (releaseCreated) {
        router.push(
          {
            pathname: `/${releasePubkey.toBase58()}`,
            query: {
              metadata: JSON.stringify(metadata),
            },
          },
          `/${releasePubkey.toBase58()}`
        )
      } else if (track && artwork) {
        let upload = uploadId
        let artworkResult = artworkTx
        if (!uploadId) {
          setIsPublishing(true)
          enqueueSnackbar(
            'Uploading artwork to Arweave.  Please confirm in wallet.',
            {
              variant: 'info',
            }
          )
          artworkResult = (await bundlrUpload(artwork.file)).data.id
          setArtworkTx(artworkResult)
          upload = createUpload(
            UploadType.artwork,
            artworkResult,
            formValues.releaseForm
          )
          setUploadId(upload)
        }
        if (uploadHasItemForType(upload, UploadType.artwork) || artworkResult) {
          let trackResult = trackTx
          if (!uploadHasItemForType(upload, UploadType.track)) {
            enqueueSnackbar(
              'Uploading track to Arweave.  Please confirm in wallet.',
              {
                variant: 'info',
              }
            )
            trackResult = (await bundlrUpload(track.file)).data.id
            setTrackTx(trackResult)
            updateUpload(upload, UploadType.track, trackResult)
          }
          if (uploadHasItemForType(upload, UploadType.track) || trackResult) {
                     let metadataResult = metadataTx
            const info = releaseInfo || (await initializeReleaseAndMint())
            setReleaseInfo(info)
            setReleasePubkey(info.release)
            if (!uploadHasItemForType(upload, UploadType.metadataJson)) {
              enqueueSnackbar(
                'Uploading Metadata to Arweave.  Please confirm in wallet.',
                {
                  variant: 'info',
                }
              )

              const metadataJson = releaseCreateMetadataJson({
                release: info.release,
                ...formValues.releaseForm,
                trackTx: trackResult,
                artworkTx: artworkResult,
                trackType: track.file.type,
                artworkType: artwork.file.type,
                duration: track.meta.duration,
              })
              metadataResult = (
                await bundlrUpload(
                  new Blob([JSON.stringify(metadataJson)], {
                    type: 'application/json',
                  })
                )
              ).data.id

              setMetadata(metadataJson)
              setMetadataTx(metadataResult)
              updateUpload(
                upload,
                UploadType.metadataJson,
                metadataResult,
                info
              )
            }
            if (
              uploadHasItemForType(upload, UploadType.metadataJson) ||
              metadataResult
            ) {
              enqueueSnackbar(
                'Finalizing Release.  Please confirm in wallet.',
                {
                  variant: 'info',
                }
              )

              const result = await releaseCreate({
                ...formValues.releaseForm,
                release: info.release,
                releaseBump: info.releaseBump,
                releaseMint: info.releaseMint,
                metadataUri: `https://arweave.net/${metadataResult}`,
                release: info.release,
                releaseBump: info.releaseBump,
                releaseMint: info.releaseMint,            
              })

              if (result.success) {
                enqueueSnackbar('Release Created!', {  
                  variant: 'success',
                })

                removeUpload(upload)
                setIsPublishing(false)
                setReleaseCreated(true)
              } else {
                setIsPublishing(false)
                enqueueSnackbar('Error creating release - please try again.', {
                  variant: 'error',
                })
              }
            }
          }
        } else {
          console.warn('didnt mean condition')
        }
      }
    } catch (error) {
      setIsPublishing(false)
    }
  }

  const handleProgress = (progress, isImage) => {
    if (isImage) {
      setImageProgress(progress)
    } else {
      setAudioProgress(progress)
    }
  }

  return (
    <Grid item md={12}>
      {!wallet.connected && (
        <ConnectMessage variant="body" gutterBottom>
          Please connect your wallet to start publishing
        </ConnectMessage>
      )}

      {wallet?.connected && npcAmountHeld < 1 && (
        <Box style={{display: "flex"}}>
          <NpcMessage>
            <Typography variant="h3">
              Currently, Nina Publishing Credits (NPCs) are required to access
              the publishing flow.
            </Typography>
            <Typography variant="h3">
              1 NPC allows the publishing of 1 Release.
            </Typography>
            <Typography variant="h3">
              If you don’t have a Solana wallet, please set one up at{" "}
              <Link target="_blank" rel="noreferrer" href="https://phantom.app">
                phantom.app
              </Link>
              .
            </Typography>
            <Typography variant="h3">
              Please fill out{" "}
              <Link
                target="_blank"
                rel="noreferrer"
                href="https://docs.google.com/forms/d/e/1FAIpQLSdj13RKQcw9GXv3A5U4ebJhzJjjfxzxuCtB092X4mkHm5XX0w/viewform"
              >
                this form
              </Link>{" "}
              and we will notify you when your credits have been distributed.
            </Typography>

            <Typography variant="h3">
              Check our <Link href="/faq">FAQ</Link> or hit us at{" "}
              <Link
                target="_blank"
                rel="noreferrer"
                href="href=mailto:artists@ninaprotocol.com"
              >
                artists@ninaprotocol.com
              </Link>{" "}
              with any questions.
            </Typography>
          </NpcMessage>
        </Box>
      )}
      {wallet?.connected && npcAmountHeld > 0 && (
        <>
          <UploadInfoModal userHasSeenUpdateMessage={localStorage.getItem('nina-upload-update-message')}/>
          <NinaBox columns="350px 400px" gridColumnGap="10px">

            <Box sx={{width: '100%'}}>
              <MediaDropzones
                setTrack={setTrack}
                setArtwork={setArtwork}
                values={formValues}
                releasePubkey={releasePubkey}
                track={track}
                disabled={isPublishing || releaseCreated}
                handleProgress={handleProgress}
              />
            </Box>

            <CreateFormWrapper>
              <ReleaseCreateForm
                onChange={handleFormChange}
                values={formValues.releaseForm}
                ReleaseCreateSchema={ReleaseCreateSchema}
                disabled={isPublishing}
              />
            </CreateFormWrapper>

            <CreateCta>
              {bundlrBalance === 0 && <BundlrModal inCreate={true} />}
              {bundlrBalance > 0 && formValuesConfirmed && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={
                    isPublishing ||
                    !formIsValid ||
                    bundlrBalance === 0 ||
                    mbs < uploadSize ||
                    artwork?.meta.status === 'uploading' ||
                    (track?.meta.status === 'uploading' && !releaseCreated)
                  }
                  sx={{height: '54px'}}
                >
                  {isPublishing && !releaseCreated && (
                    <Dots msg={publishingStepText} />
                  )}
                  {!isPublishing && buttonText}
                </Button>
              )}

              {bundlrBalance > 0 && !formValuesConfirmed && (
                <ReleaseCreateConfirm
                  formValues={formValues}
                  formIsValid={formIsValid}
                  handleSubmit={handleSubmit}
                  setFormValuesConfirmed={setFormValuesConfirmed}
                  artwork={artwork}
                  track={track}
                />
              )}

              {pending && (
                <LinearProgress
                  variant="determinate"
                  value={audioProgress || imageProgress}
                />
              )}

              <Box display="flex" justifyContent="space-between">
                {bundlrBalance > 0 && (
                  <BundlrBalanceInfo variant="subtitle1" align="left">
                    Balance: {bundlrBalance?.toFixed(4)} SOL / $
                    {bundlrUsdBalance.toFixed(2)} / {mbs?.toFixed(2)} MB ($
                    {(bundlrUsdBalance / mbs)?.toFixed(4)}/MB)
                  </BundlrBalanceInfo>
                )}
                {bundlrBalance === 0 && (
                  <BundlrBalanceInfo variant="subtitle1" align="left">
                    Please fund your Bundlr Account to enable publishing
                  </BundlrBalanceInfo>
                )}
                {uploadSize > 0 && (
                  <Typography variant="subtitle1" align="right">
                    Upload Size: {uploadSize} MB | Cost: $
                    {(uploadSize * (bundlrUsdBalance / mbs)).toFixed(2)}
                  </Typography>
                )}
      
                <BundlrModal inCreate={false} displaySmall={true}/>
              </Box>
            </CreateCta>
          </NinaBox>
        </>
      )}
    </Grid>
  )
}

const ConnectMessage = styled(Typography)(() => ({
  gridColumn: '1/3',
  paddingTop: '30px',
}))

const CreateFormWrapper = styled(Box)(({theme}) => ({
  width: '100%',
  height: '476px',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${theme.palette.grey.primary}`,
}))

const CreateCta = styled(Box)(({theme}) => ({
  gridColumn: '1/3',
  width: '100%',
  position: 'relative',
  '& .MuiButton-root': {
    ...theme.helpers.baseFont,
  },
}))

const BundlrBalanceInfo = styled(Typography)(({theme}) => ({
  whiteSpace: 'nowrap',
  margin: '5px 0',
}))

const NpcMessage = styled(Box)(({theme}) => ({
  textAlign: "left",
  margin: "auto",
  width: "800px",
  padding: "0 0 50px",
  [theme.breakpoints.down("md")]: {
    width: "80vw",
  },
  "& .MuiTypography-root": {
    paddingBottom: "10px",
  },
  "& a": {
    color: theme.palette.blue,
  },
}));

export default ReleaseCreate
