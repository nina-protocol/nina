import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import * as Yup from 'yup'
import Nina from '../contexts/Nina'
import Release from '../contexts/Release'
import Hub from '../contexts/Hub'
import Wallet from '../contexts/Wallet'
import { getMd5FileHash } from '../utils'
import { useSnackbar } from 'notistack'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import ReleaseCreateForm from './ReleaseCreateForm'
import ReleaseCreateConfirm from './ReleaseCreateConfirm'
import NinaBox from './NinaBox'
import Dots from './Dots'
import MediaDropzones from './MediaDropzones'
import LowSolWarning from './LowSolWarning'
import {
  createUpload,
  updateUpload,
  removeUpload,
  UploadType,
  uploadHasItemForType,
} from '../utils/uploadManager'
import roundUp from '../utils/formatting'

const NoSolWarning = dynamic(() => import('./NoSolWarning'), { ssr: false })
const BundlrModal = dynamic(() => import('./BundlrModal'), { ssr: false })
const ReleaseCreateSuccess = dynamic(() => import('./ReleaseCreateSuccess'), {
  ssr: false,
})

const ReleaseCreateSchema = Yup.object().shape({
  artist: Yup.string().required('Artist is required'),
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  catalogNumber: Yup.string().required('Catalog Number is required'),
  amount: Yup.string().required('Edition Size is required'),
  retailPrice: Yup.number().required('Retail Price is required'),
  resalePercentage: Yup.number().required('Resale Percentage is required'),
})

const ReleaseCreate = ({ canAddContent, hubPubkey }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { wallet, pendingTransactionMessage, shortPendingTransactionMessage } =
    useContext(Wallet.Context)
  const {
    releaseState,
    initializeReleaseAndMint,
    releaseCreateMetadataJson,
    releaseInit,
    validateUniqueMd5Digest,
    releaseInitViaHub,
    pendingReleases,
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
    checkIfHasBalanceToCompleteAction,
    NinaProgramAction,
    NinaProgramActionCost,
    solBalance,
    ninaClient,
    getUserBalances,
    solBalanceFetched,
  } = useContext(Nina.Context)

  const { getHubsForUser, fetchedHubsForUser, filterHubsForUser, hubState } =
    useContext(Hub.Context)

  const releaseCreateFee = roundUp(
    NinaProgramActionCost?.RELEASE_INIT_VIA_HUB,
    3
  )

  const formattedSolBalance = ninaClient
    .nativeToUi(solBalance, ninaClient.ids.mints.wsol)
    .toFixed(3)
  const [track, setTrack] = useState(undefined)
  const [artwork, setArtwork] = useState(undefined)
  const [uploadSize, setUploadSize] = useState()
  const [releasePubkey, setReleasePubkey] = useState(undefined)
  const [, setRelease] = useState(undefined)
  const [buttonText, setButtonText] = useState('Publish Release')
  const [pending] = useState(false)
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
  const [releaseCreated, setReleaseCreated] = useState()
  const [uploadId, setUploadId] = useState()
  const [publishingStepText, setPublishingStepText] = useState()
  const [md5Digest, setMd5Digest] = useState()
  const [profileHubs, setProfileHubs] = useState()
  const [selectedHub, setSelectedHub] = useState()
  const [processingProgress, setProcessingProgress] = useState()
  const [awaitingPendingReleases, setAwaitingPendingReleases] = useState(false)
  const [showLowUploadModal, setShowLowUploadModal] = useState(false)
  const [open, setOpen] = useState(false)
  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])

  const availableStorage = useMemo(
    () => bundlrBalance / bundlrPricePerMb,
    [bundlrBalance, bundlrPricePerMb]
  )
  const bundlrUsdBalance = useMemo(
    () => bundlrBalance * solPrice,
    [bundlrBalance, solPrice]
  )
  useEffect(() => {
    refreshBundlr()
    getUserBalances()
  }, [])

  useEffect(() => {
    if (wallet.connected && solBalance === 0 && solBalanceFetched) {
      setOpen(true)
    }
  }, [solBalanceFetched])

  useEffect(() => {
    const checkBalance = setInterval(() => {
      if (releaseCreateFee > solBalance) {
        getUserBalances()
      }
    }, 5000)
    return () => clearInterval(checkBalance)
  }, [getUserBalances, releaseCreateFee, solBalance])

  useEffect(() => {
    if (releasePubkey && releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey])
    }
  }, [releaseState.tokenData[releasePubkey]])

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

  useEffect(() => {
    if (isPublishing) {
      if (!artworkTx) {
        setPublishingStepText(
          `1/4 Uploading Artwork. ${pendingTransactionMessage}, do not close this window.`
        )
      } else if (!trackTx) {
        setPublishingStepText(
          `2/4 Uploading Track. ${pendingTransactionMessage}, do not close this window. This may take a while.`
        )
      } else if (!metadataTx) {
        setPublishingStepText(
          `3/4 Uploading Metadata. ${pendingTransactionMessage}, do not close this window.`
        )
      } else {
        setPublishingStepText(
          `4/4 Finalizing Release. ${pendingTransactionMessage}, do not close this window.`
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
          'There may have been an error creating this release. Please check for the release in your profile and contact us before trying again.'
        )
      } else if (availableStorage < uploadSize) {
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
    if (Object.keys(pendingReleases).length > 0) {
      setAwaitingPendingReleases(true)
    } else {
      setAwaitingPendingReleases(false)
    }
  }, [pendingReleases])

  useEffect(() => {
    if (availableStorage < uploadSize && !showLowUploadModal) {
      setShowLowUploadModal(true)
    }
  }, [availableStorage, uploadSize])

  const handleFormChange = useCallback(
    async (values) => {
      setFormValues({
        ...formValues,
        releaseForm: values,
      })
    },
    [formValues]
  )

  const handleSubmit = async () => {
    try {
      if (releaseCreated && hubPubkey) {
        router.push({
          pathname: `/${
            hubData.handle
          }/releases/${releaseInfo?.hubRelease?.toBase58()}`,
        })
      } else if (releaseCreated && !hubPubkey) {
        router.push(
          {
            pathname: `/${releasePubkey?.toBase58()}`,
            query: {
              metadata: JSON.stringify(metadata),
            },
          },
          `/${releasePubkey.toBase58()}`
        )
      } else if (track && artwork && md5Digest) {
        const error = await checkIfHasBalanceToCompleteAction(
          NinaProgramAction.RELEASE_INIT_WITH_CREDIT
        )

        const fileTypesValid =
          track.file.type === 'audio/mpeg' && artwork.file.type === 'image/png'

        if (!fileTypesValid) {
          enqueueSnackbar(
            'File types incorrect, please try again with an .mp3 and .png',
            { variant: 'failure' }
          )
          setTrack(undefined)
          setArtwork(undefined)
          return
        }

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
            `Uploading artwork to Arweave.  ${shortPendingTransactionMessage}`,
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
              `Uploading track to Arweave.  ${shortPendingTransactionMessage}`,
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
            const info = await initializeReleaseAndMint(
              hubPubkey ? hubPubkey : undefined
            )

            setReleaseInfo(info)
            setReleasePubkey(info.release)
            if (!uploadHasItemForType(upload, UploadType.metadataJson)) {
              enqueueSnackbar(
                `Uploading Metadata to Arweave.  ${shortPendingTransactionMessage}`,
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
                `Finalizing Release.  ${shortPendingTransactionMessage}`,
                {
                  variant: 'info',
                }
              )
              let result

              if (hubPubkey) {
                result = await releaseInitViaHub({
                  hubPubkey,
                  ...formValues.releaseForm,
                  release: info.release,
                  releaseBump: info.releaseBump,
                  releaseMint: info.releaseMint,
                  metadataUri: `https://arweave.net/${metadataResult}`,
                })
              } else if (selectedHub && selectedHub !== '') {
                result = await releaseInitViaHub({
                  ...formValues.releaseForm,
                  hubPubkey: selectedHub,
                  release: info.release,
                  releaseBump: info.releaseBump,
                  releaseMint: info.releaseMint,
                  metadataUri: `https://arweave.net/${metadataResult}`,
                })
              } else {
                result = await releaseInit({
                  ...formValues.releaseForm,
                  release: info.release,
                  releaseBump: info.releaseBump,
                  releaseMint: info.releaseMint,
                  metadataUri: `https://arweave.net/${metadataResult}`,
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
        } else {
          console.warn('didnt mean condition')
        }
      }
    } catch (error) {
      console.warn('Release Create handleSubmit error:', error)
      setIsPublishing(false)
    }
  }

  const refreshBundlr = () => {
    getBundlrBalance()
    getBundlrPricePerMb()
    getSolPrice()
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
  }

  const getUserHubs = async (publicKey) => {
    try {
      await getHubsForUser(publicKey)
    } catch {
      enqueueSnackbar('Error fetching hubs for user', {
        variant: 'error',
      })
    }
  }

  const handleReload = () => {
    setTrack(undefined)
    setArtwork(undefined)
    setUploadSize(0)
    setReleasePubkey(undefined)
    setButtonText('Publish Release')
    setFormIsValid(false)
    setFormValues({ ...formValues, releaseForm: {} })
    setImageProgress(0)
    setAudioProgress(0)
    setFormValuesConfirmed(false)
    setReleaseInfo(undefined)
    setArtworkTx(undefined)
    setTrackTx(undefined)
    setIsPublishing(false)
    setMetadata(undefined)
    setMetadataTx(undefined)
    setReleaseCreated(false)
    setUploadId(undefined)
    setPublishingStepText(undefined)
    setMd5Digest(undefined)
    setProcessingProgress(0)
    setTrack(undefined)
    setMetadata(undefined)
    setReleaseInfo(undefined)
    setReleasePubkey(undefined)
    setUploadId(undefined)
    setAudioProgress(0)
    router.push(
      hubPubkey !== undefined
        ? `${hubData.handle}/dashboard?action=publishRelease`
        : '/upload'
    )
  }

  if (
    wallet.connected &&
    solBalance > 0 &&
    releaseCreateFee > formattedSolBalance
  ) {
    return (
      <LowSolWarning
        requiredSol={releaseCreateFee}
        formattedSolBalance={formattedSolBalance}
        action={'publish'}
      />
    )
  }

  return (
    <Grid item md={12}>
      {!wallet.connected && (
        <ConnectMessage variant="body" gutterBottom>
          Please connect your wallet to start publishing
        </ConnectMessage>
      )}

      <NoSolWarning action={'upload'} open={open} setOpen={setOpen} />
      {releaseCreated && (
        <ReleaseCreateSuccess
          releasePubkey={releasePubkey}
          hubReleasePubkey={releaseInfo?.hubRelease?.toBase58()}
          inHubs={hubPubkey !== undefined}
          hubHandle={hubPubkey !== undefined ? hubData.handle : ''}
          artist={formValues.releaseForm.artist}
          title={formValues.releaseForm.title}
          url={`${
            hubPubkey !== undefined
              ? `${hubData.handle}/releases/${releasePubkey}`
              : releasePubkey
          }`}
          image={artworkTx}
          handleReload={handleReload}
        />
      )}

      {wallet?.connected && !solBalanceFetched && <Dots size={'50px'} />}
      {wallet?.connected && !releaseCreated && solBalanceFetched && (
        <>
          <NinaBox columns="350px 400px" gridColumnGap="10px">
            <Box sx={{ width: '100%' }}>
              <MediaDropzones
                setTrack={setTrack}
                setArtwork={setArtwork}
                values={formValues}
                releasePubkey={releasePubkey}
                track={track}
                artwork={artwork}
                disabled={
                  isPublishing || releaseCreated || awaitingPendingReleases
                }
                handleProgress={handleProgress}
                processingProgress={processingProgress}
              />
            </Box>
            <CreateFormWrapper disabled={awaitingPendingReleases}>
              <ReleaseCreateForm
                onChange={handleFormChange}
                values={formValues.releaseForm}
                ReleaseCreateSchema={ReleaseCreateSchema}
                disabled={
                  isPublishing || releaseCreated || awaitingPendingReleases
                }
              />
            </CreateFormWrapper>
            <CreateCta>
              {bundlrBalance === 0 &&
                releaseCreateFee < formattedSolBalance && (
                  <BundlrModal inCreate={true} />
                )}

              {formValuesConfirmed &&
                bundlrBalance > 0 &&
                releaseCreateFee < formattedSolBalance && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={(e) => handleSubmit(e)}
                    disabled={
                      isPublishing ||
                      !formIsValid ||
                      bundlrBalance === 0 ||
                      availableStorage < uploadSize ||
                      artwork?.meta.status === 'uploading' ||
                      (track?.meta.status === 'uploading' && !releaseCreated) ||
                      (artworkTx && trackTx && metadataTx && !releaseCreated)
                    }
                    href={
                      releaseCreated &&
                      hubPubkey &&
                      releaseInfo?.hubRelease?.toBase58()
                        ? `/${
                            hubData.handle
                          }/releases/${releaseInfo?.hubRelease?.toBase58()}`
                        : `/${releasePubkey?.toBase58()}`
                    }
                    sx={{ height: '54px' }}
                  >
                    {isPublishing && !releaseCreated && (
                      <Dots msg={publishingStepText} />
                    )}
                    {!isPublishing && (
                      <Typography variant="body2">{buttonText}</Typography>
                    )}
                  </Button>
                )}

              {releaseCreateFee > formattedSolBalance && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() => setOpen(true)}
                >
                  You do not have enough SOL to create a release.
                </Button>
              )}

              {!canAddContent && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={(e) => handleSubmit(e)}
                  disabled={
                    isPublishing ||
                    !formIsValid ||
                    bundlrBalance === 0 ||
                    availableStorage < uploadSize ||
                    artwork?.meta.status === 'uploading' ||
                    (track?.meta.status === 'uploading' && !releaseCreated)
                  }
                  sx={{ height: '54px' }}
                >
                  You do not have allowance or permission to create releases.
                </Button>
              )}
              {bundlrBalance > 0 &&
                !formValuesConfirmed &&
                releaseCreateFee < formattedSolBalance && (
                  <ReleaseCreateConfirm
                    formValues={formValues}
                    formIsValid={formIsValid && processingProgress === 1}
                    handleSubmit={(e) => handleSubmit(e)}
                    setFormValuesConfirmed={setFormValuesConfirmed}
                    artwork={artwork}
                    track={track}
                    profileHubs={profileHubs}
                    setSelectedHub={setSelectedHub}
                    selectedHub={selectedHub}
                    handleChange={(e) => handleHubSelect(e)}
                    hubPubkey={hubPubkey}
                    awaitingPendingReleases={awaitingPendingReleases}
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
                    {bundlrUsdBalance.toFixed(2)} /{' '}
                    {availableStorage?.toFixed(2)} MB ($
                    {(bundlrUsdBalance / availableStorage)?.toFixed(4)}/MB)
                  </BundlrBalanceInfo>
                )}
                {bundlrBalance === 0 && (
                  <BundlrBalanceInfo variant="subtitle1" align="left">
                    Please fund your Upload Account to enable publishing
                  </BundlrBalanceInfo>
                )}
                {uploadSize > 0 && (
                  <Typography
                    variant="subtitle1"
                    align="right"
                    sx={{ margin: '5px 0' }}
                  >
                    Upload Size: {uploadSize} MB | Cost: $
                    {(
                      uploadSize *
                      (bundlrUsdBalance / availableStorage)
                    ).toFixed(2)}
                  </Typography>
                )}

                <BundlrModal
                  showLowUploadModal={showLowUploadModal}
                  uploadSize={uploadSize}
                  inCreate={false}
                  displaySmall={true}
                />
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

const CreateFormWrapper = styled(Box)(({ theme, disabled }) => ({
  width: '100%',
  height: '476px',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${theme.palette.grey.primary}`,
  cursor: disabled ? 'not-allowed' : 'auto',
}))

const CreateCta = styled(Box)(({ theme }) => ({
  gridColumn: '1/3',
  width: '100%',
  position: 'relative',
  '& .MuiButton-root': {
    ...theme.helpers.baseFont,
  },
}))

const BundlrBalanceInfo = styled(Typography)(() => ({
  whiteSpace: 'nowrap',
  margin: '5px 0',
}))

export default ReleaseCreate
