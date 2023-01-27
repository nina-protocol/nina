import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import * as Yup from 'yup'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import { getMd5FileHash } from '@nina-protocol/nina-internal-sdk/esm/utils'
import { useSnackbar } from 'notistack'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import dynamic from 'next/dynamic'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/router'
import ReleaseCreateForm from '@nina-protocol/nina-internal-sdk/esm/ReleaseCreateForm'
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
import EmailCapture from '@nina-protocol/nina-internal-sdk/esm/EmailCapture'
const BundlrModal = dynamic(() => import('./BundlrModal'))
const ReleaseCreateSchema = Yup.object().shape({
  artist: Yup.string().required('Artist is Required'),
  title: Yup.string().required('Title is Required'),
  description: Yup.string(),
  catalogNumber: Yup.string().required('Catalog Number is Required'),
  amount: Yup.string().required('Edition Size is Required'),
  retailPrice: Yup.number().required('Price is Required'),
  resalePercentage: Yup.number().required('Resale Percent Amount is Required'),
})

const ReleaseCreate = () => {
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const {
    releaseState,
    initializeReleaseAndMint,
    releaseCreateMetadataJson,
    releaseCreate,
    validateUniqueMd5Digest,
    releaseInitViaHub,
  } = useContext(Release.Context)
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
    npcAmountHeld,
    checkIfHasBalanceToCompleteAction,
    NinaProgramAction,
  } = useContext(Nina.Context)

  const { getHubsForUser, fetchedHubsForUser, filterHubsForUser } = useContext(
    Hub.Context
  )

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
  const [md5Digest, setMd5Digest] = useState()
  const [profileHubs, setProfileHubs] = useState()
  const [hubOptions, setHubOptions] = useState()
  const [selectedHub, setSelectedHub] = useState()
  const [processingProgress, setProcessingProgress] = useState()

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
    getNpcAmountHeld()
  }, [wallet?.connected])

  useEffect(() => {
    let publicKey
    if (wallet.connected) {
      publicKey = wallet.publicKey.toBase58()
      getUserHubs(publicKey)
    }
  }, [wallet?.connected])

  useEffect(() => {
    if (wallet.connected) {
      let publicKey = wallet?.publicKey?.toBase58()
      if (fetchedHubsForUser.has(publicKey)) {
        const hubs = filterHubsForUser(publicKey)
        const sortedHubs = hubs?.sort((a, b) => {
          return a?.data?.displayName?.localeCompare(b?.data?.displayName)
        })
        setProfileHubs(sortedHubs)
        setSelectedHub(sortedHubs[0]?.publicKey)
      }
    }
  }, [fetchedHubsForUser])

  const getUserHubs = async (publicKey) => {
    try {
      await getHubsForUser(publicKey)
    } catch {
      enqueueSnackbar('Error fetching hubs for user', {
        variant: 'error',
      })
    }
  }

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
        setButtonText(
          'There may have been an error creating this release. Please wait 30 seconds and check for the release in your profile before retrying'
        )
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

  useEffect(() => {
    if (track) {
      const handleGetMd5FileHash = async (track) => {
        const hash = await getMd5FileHash(track.file, (progress) =>
          setProcessingProgress(progress)
        )
        setMd5Digest(hash)
      }
      handleGetMd5FileHash(track)
    }
  }, [track])

  const handleSubmit = async () => {
    try {
      if (releaseCreated) {
        // router.push(
        //   {
        //     pathname: `/${releasePubkey.toBase58()}`,
        //     query: {
        //       metadata: JSON.stringify(metadata),
        //     },
        //   },
        //   `/${releasePubkey.toBase58()}`
        // )
      } else if (track && artwork && md5Digest) {
        const error = await checkIfHasBalanceToCompleteAction(
          NinaProgramAction.RELEASE_INIT_WITH_CREDIT
        )
        if (error) {
          enqueueSnackbar(error.msg, { variant: 'failure' })
          return
        }

        const release = await validateUniqueMd5Digest(md5Digest)
        if (release) {
          enqueueSnackbar(
            `A release with this audio file already exists: ${release.metadata.properties.artist} - ${release.metadata.properties.title}`,
            {
              variant: 'warn',
            }
          )

          return
        }
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
          artworkResult = await bundlrUpload(artwork.file)
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
          setIsPublishing(true)
          if (!uploadHasItemForType(upload, UploadType.track)) {
            enqueueSnackbar(
              'Uploading track to Arweave.  Please confirm in wallet.',
              {
                variant: 'info',
              }
            )
            trackResult = await bundlrUpload(track.file)
            if (trackResult) {
              setTrackTx(trackResult)
              updateUpload(upload, UploadType.track, trackResult)
            }
          }
          if (uploadHasItemForType(upload, UploadType.track) || trackResult) {
            let metadataResult = metadataTx
            setIsPublishing(true)
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
                md5Digest,
              })
              metadataResult = await bundlrUpload(
                new Blob([JSON.stringify(metadataJson)], {
                  type: 'application/json',
                })
              )

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
              let result
              if (selectedHub && selectedHub !== '') {
                console.log('selectedHub', selectedHub)
                result = await releaseInitViaHub({
                  ...formValues.releaseForm,
                  hubPubkey: selectedHub,
                  release: info.release,
                  releaseBump: info.releaseBump,
                  releaseMint: info.releaseMint,
                  metadataUri: `https://arweave.net/${metadataResult}`,
                })
              } else {
                result = await releaseCreate({
                  ...formValues.releaseForm,
                  release: info.release,
                  releaseBump: info.releaseBump,
                  releaseMint: info.releaseMint,
                  metadataUri: `https://arweave.net/${metadataResult}`,
                  release: info.release,
                  releaseBump: info.releaseBump,
                  releaseMint: info.releaseMint,
                })
              }

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
        }
      }
    } catch (error) {
      console.warn('Release Create handleSubmit error:', error)
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
  const handleHubSelect = (e) => {
    
    const {
      target: { value },
    } = e
    setSelectedHub(value)
    console.log('selectedHub', selectedHub)
  }

  return (
    <Grid item md={12}>
      {!wallet.connected && (
        <ConnectMessage variant="body" gutterBottom>
          Please connect your wallet to start publishing
        </ConnectMessage>
      )}

      {wallet?.connected &&
        npcAmountHeld === 0 &&
        (!profileHubs || profileHubs?.length === 0) && (
          <Box style={{ display: 'flex' }}>
            <NpcMessage>
              <Typography variant="h3" sx={{ mb: 1 }}>
                Nina is currently in a closed beta for uploading releases.
              </Typography>
              <EmailCapture size="medium" />
              <Typography variant="h3" sx={{ mt: 1 }}>
                Check our <Link href="/faq">FAQ</Link> or hit us at{' '}
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="href=mailto:artists@ninaprotocol.com"
                >
                  artists@ninaprotocol.com
                </Link>{' '}
                with any questions.
              </Typography>
            </NpcMessage>
          </Box>
        )}
      {wallet?.connected && (npcAmountHeld >= 1 || profileHubs?.length > 0) && (
        <>
          <UploadInfoModal
            userHasSeenUpdateMessage={localStorage.getItem(
              'nina-upload-update-message'
            )}
          />
         
          <NinaBox columns="350px 400px" gridColumnGap="10px">
            <Box sx={{ width: '100%' }}>
              <MediaDropzones
                setTrack={setTrack}
                setArtwork={setArtwork}
                values={formValues}
                releasePubkey={releasePubkey}
                track={track}
                disabled={isPublishing || releaseCreated}
                handleProgress={handleProgress}
                processingProgress={processingProgress}
              />
            </Box>

            <CreateFormWrapper>
              <ReleaseCreateForm
              onChange={handleFormChange}
              values={formValues.releaseForm}
              ReleaseCreateSchema={ReleaseCreateSchema}
              disabled={isPublishing || releaseCreated}
              />
            </CreateFormWrapper>

            <CreateCta>
              {bundlrBalance === 0 ? (
                <BundlrModal inCreate={true} />
              ) : (
                formValuesConfirmed && (
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
                      (track?.meta.status === 'uploading' && !releaseCreated) ||
                      (artworkTx && trackTx && metadataTx && !releaseCreated)
                    }
                    sx={{ height: '54px' }}
                  >
                    {isPublishing && !releaseCreated && (
                      <Dots msg={publishingStepText} />
                    )}
                    {!isPublishing && buttonText}
                  </Button>
                )
              )}

              {bundlrBalance > 0 && !formValuesConfirmed && (
                <ReleaseCreateConfirm
                  formValues={formValues}
                  formIsValid={formIsValid && processingProgress === 1}
                  handleSubmit={handleSubmit}
                  setFormValuesConfirmed={setFormValuesConfirmed}
                  artwork={artwork}
                  track={track}
                  profileHubs={profileHubs}
                  setSelectedHub={setSelectedHub}
                  selectedHub={selectedHub}
                  handleChange={(e) => handleHubSelect(e)}
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
                    Please fund your Upload Account to enable publishing
                  </BundlrBalanceInfo>
                )}
                {uploadSize > 0 && (
                  <Typography variant="subtitle1" align="right">
                    Upload Size: {uploadSize} MB | Cost: $
                    {(uploadSize * (bundlrUsdBalance / mbs)).toFixed(2)}
                  </Typography>
                )}

                <BundlrModal inCreate={false} displaySmall={true} />
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

const CreateFormWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '476px',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${theme.palette.grey.primary}`,
}))

const CreateCta = styled(Box)(({ theme }) => ({
  gridColumn: '1/3',
  width: '100%',
  position: 'relative',
  '& .MuiButton-root': {
    ...theme.helpers.baseFont,
  },
}))

const BundlrBalanceInfo = styled(Typography)(({ theme }) => ({
  whiteSpace: 'nowrap',
  margin: '5px 0',
}))

const NpcMessage = styled(Box)(({ theme }) => ({
  textAlign: 'left',
  margin: 'auto',
  width: '800px',
  padding: '0 0 50px',
  [theme.breakpoints.down('md')]: {
    width: '80vw',
  },
  '& .MuiTypography-root': {
    paddingBottom: '10px',
  },
  '& a': {
    color: theme.palette.blue,
  },
}))

export default ReleaseCreate
