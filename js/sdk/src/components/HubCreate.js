import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import * as Yup from 'yup'
import Hub from '../contexts/Hub'
import Nina from '../contexts/Nina'
import Wallet from '../contexts/Wallet'
import { useSnackbar } from 'notistack'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import dynamic from 'next/dynamic'
import HubCreateForm from './HubCreateForm'
import HubCreateConfirm from './HubCreateConfirm'
import NinaBox from './NinaBox'
import Dots from './Dots'
import ImageMediaDropzone from './ImageMediaDropzone'
const BundlrModal = dynamic(() => import('./BundlrModal'), { ssr: false })
const ColorModal = dynamic(() => import('./ColorModal'), { ssr: false })
const HubCreateSuccess = dynamic(() => import('./HubCreateSuccess'), {
  ssr: false,
})
import {
  createUpload,
  updateUpload,
  removeUpload,
  UploadType,
  uploadHasItemForType,
} from '../utils/uploadManager'
import NoSolWarning from './NoSolWarning'

const HubCreateSchema = Yup.object().shape({
  handle: Yup.string().required('Hub Handle is Required'),
  displayName: Yup.string().required('Display Name is Required'),
  publishFee: Yup.number().required('Publish Fee is Required'),
  referralFee: Yup.number().required('Referral Fee is Required'),
  description: Yup.string(),
})

const HubCreate = ({ update, hubData, inHubs }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { wallet } = useContext(Wallet.Context)
  const { hubInit, hubUpdateConfig, validateHubHandle } = useContext(
    Hub.Context
  )
  const {
    bundlrUpload,
    bundlrBalance,
    bundlrPricePerMb,
    solPrice,
    solBalance,
    solBalanceFetched,
    checkIfHasBalanceToCompleteAction,
    NinaProgramAction,
    getUserBalances,
  } = useContext(Nina.Context)
  const [artwork, setArtwork] = useState()
  const [uploadSize, setUploadSize] = useState()
  const [hubPubkey, setHubPubkey] = useState(hubData?.publicKey || undefined)
  const [buttonText, setButtonText] = useState(
    update ? 'Update Hub' : 'Create Hub'
  )
  const [formIsValid, setFormIsValid] = useState(false)
  const [formValues, setFormValues] = useState({
    hubForm: {},
  })
  const [backgroundColor, setBackgroundColor] = useState()
  const [textColor, setTextColor] = useState()
  const [formValuesConfirmed, setFormValuesConfirmed] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [artworkTx, setArtworkTx] = useState()
  const [metadataTx, setMetadataTx] = useState()
  const [hubCreated, setHubCreated] = useState(false)
  const [uploadId, setUploadId] = useState()
  const [publishingStepText, setPublishingStepText] = useState()
  const [open, setOpen] = useState(false)
  const mbs = useMemo(
    () => bundlrBalance / bundlrPricePerMb,
    [bundlrBalance, bundlrPricePerMb]
  )
  const bundlrUsdBalance = useMemo(
    () => bundlrBalance * solPrice,
    [bundlrBalance, solPrice]
  )

  useEffect(() => {
    getUserBalances()
  }, [])

  useEffect(() => {
    if (wallet.connected && solBalance === 0 && solBalanceFetched) {
      setOpen(true)
    }
  }, [solBalanceFetched])

  useEffect(() => {
    if (isPublishing) {
      if (!artworkTx) {
        setPublishingStepText(
          '1/3 Uploading Artwork.  Please confirm in wallet and do not close this window.'
        )
      } else if (!metadataTx) {
        setPublishingStepText(
          '2/3 Uploading Metadata.  Please confirm in wallet and do not close this window.'
        )
      } else {
        setPublishingStepText(
          '3/3 Finalizing Hub.  Please confirm in wallet and do not close this window.'
        )
      }
    } else {
      if (artworkTx && !metadataTx) {
        setButtonText('Restart 2/3: Upload Metadata.')
      } else if (artworkTx && metadataTx && !hubCreated) {
        setButtonText('Restart 3/3: Finalize Hub')
      } else if (mbs < uploadSize) {
        setButtonText(
          `Upload requires more storage than available in your bundlr account, please top up`
        )
      }
    }
  }, [artworkTx, metadataTx, isPublishing, hubCreated, bundlrBalance])

  useEffect(() => {
    if (hubData?.data.backgroundColor) {
      setBackgroundColor(hubData.data.backgroundColor)
    }
    if (hubData?.data.textColor) {
      setTextColor(hubData.data.textColor)
    }
  }, [hubData?.json])

  const handleFormChange = useCallback(
    async (values) => {
      setFormValues({
        ...formValues,
        hubForm: values,
      })
    },
    [formValues]
  )

  useEffect(() => {
    if (update) {
      //double check that this works
      setFormIsValid(true)
      setFormValuesConfirmed(true)
      return
    }
    if (artwork) {
      const valid = async () => {
        const isValid = await HubCreateSchema.isValid(formValues.hubForm, {
          abortEarly: true,
        })
        setFormIsValid(isValid)
      }
      valid()
    }
  }, [formValues, artwork])

  useEffect(() => {
    const artworkSize = artwork ? artwork.meta.size / 1000000 : 0
    setUploadSize(artworkSize.toFixed(2))
  }, [artwork])

  const colorReset = () => {
    setBackgroundColor()
    setTextColor()
  }

  const handleSubmit = async () => {
    try {
      if (update) {
        const error = await checkIfHasBalanceToCompleteAction(
          NinaProgramAction.HUB_UPDATE
        )
        if (error) {
          enqueueSnackbar(error.msg, { variant: 'failure' })
          return
        }
        let upload = uploadId
        let metadataJson = {}
        let metadataResult = metadataTx
        if (artwork) {
          let artworkResult = artworkTx
          setIsPublishing(true)
          enqueueSnackbar(
            'Uploading artwork to Arweave.  Please confirm in wallet.',
            {
              variant: 'info',
            }
          )
          artworkResult = await bundlrUpload(artwork.file)
          setArtworkTx(artworkResult)
          metadataJson.image = `https://arweave.net/${artworkResult}`

          upload = createUpload(
            UploadType.artwork,
            artworkResult,
            formValues.hubForm
          )
          setUploadId(upload)
        } else {
          metadataJson.image = hubData.data.image
          upload = createUpload(
            UploadType.artwork,
            metadataJson.image,
            formValues.hubForm
          )
          setUploadId(upload)
        }

        if (!uploadHasItemForType(upload, UploadType.metadataJson)) {
          setIsPublishing(true)
          enqueueSnackbar(
            'Uploading Hub Info to Arweave.  Please confirm in wallet.',
            {
              variant: 'info',
            }
          )

          metadataJson = {
            ...metadataJson,
            displayName: formValues.hubForm.displayName
              ? formValues.hubForm.displayName
              : hubData.data.displayName,
            description: formValues.hubForm.description
              ? formValues.hubForm.description
              : hubData.data.description,
            externalUrl: formValues.hubForm.externalUrl
              ? formValues.hubForm.externalUrl
              : hubData.data.externalUrl,
          }

          if (backgroundColor) {
            metadataJson.backgroundColor = backgroundColor
          }
          if (textColor) {
            metadataJson.textColor = textColor
          }

          metadataResult = await bundlrUpload(
            new Blob([JSON.stringify(metadataJson)], {
              type: 'application/json',
            })
          )
          setMetadataTx(metadataResult)
          updateUpload(upload, UploadType.metadataJson, metadataResult)
        }

        if (
          uploadHasItemForType(upload, UploadType.metadataJson) ||
          metadataResult
        ) {
          setIsPublishing(true)
          enqueueSnackbar('Finalizing Hub.  Please confirm in wallet.', {
            variant: 'info',
          })

          const result = await hubUpdateConfig(
            hubPubkey,
            `https://arweave.net/${metadataResult}`,
            formValues.hubForm.publishFee,
            formValues.hubForm.referralFee
          )

          if (result?.success) {
            enqueueSnackbar('Hub Updated!', {
              variant: 'success',
            })

            removeUpload(upload)
            setIsPublishing(false)
          } else {
            enqueueSnackbar(result.msg, {
              variant: 'error',
            })
          }
        }
      } else {
        const error = await checkIfHasBalanceToCompleteAction(
          NinaProgramAction.HUB_INIT_WITH_CREDIT
        )
        if (error) {
          enqueueSnackbar(error.msg, { variant: 'failure' })
          return
        }
        if (artwork && (await validateHubHandle(formValues.hubForm.handle))) {
          let upload = uploadId
          let artworkResult = artworkTx
          if (!uploadId) {
            setIsPublishing(true)
            enqueueSnackbar(
              'Uploading Hub Image to Arweave.  Please confirm in wallet.',
              {
                variant: 'info',
              }
            )
            artworkResult = await bundlrUpload(artwork.file)
            setArtworkTx(artworkResult)
            upload = createUpload(
              UploadType.artwork,
              artworkResult,
              formValues.hubForm
            )
            setUploadId(upload)
          }
          if (
            uploadHasItemForType(upload, UploadType.artwork) ||
            artworkResult
          ) {
            let metadataResult = metadataTx

            if (!uploadHasItemForType(upload, UploadType.metadataJson)) {
              enqueueSnackbar(
                'Uploading Hub Info to Arweave.  Please confirm in wallet.',
                {
                  variant: 'info',
                }
              )

              const metadataJson = {
                displayName: formValues.hubForm.displayName,
                description: formValues.hubForm.description,
                externalUrl: `https://hubs.ninaprotocol.com/${formValues.hubForm.handle}`,
                image: `https://arweave.net/${artworkResult}`,
              }

              if (backgroundColor) {
                metadataJson.backgroundColor = backgroundColor
              }
              if (textColor) {
                metadataJson.textColor = textColor
              }

              metadataResult = await bundlrUpload(
                new Blob([JSON.stringify(metadataJson)], {
                  type: 'application/json',
                })
              )
              setMetadataTx(metadataResult)
              updateUpload(upload, UploadType.metadataJson, metadataResult)
            }
            if (
              uploadHasItemForType(upload, UploadType.metadataJson) ||
              metadataResult
            ) {
              enqueueSnackbar('Finalizing Hub.  Please confirm in wallet.', {
                variant: 'info',
              })

              const hubParams = {
                handle: `${
                  update ? hubData?.handle : formValues.hubForm.handle
                }`,
                publishFee: formValues.hubForm.publishFee,
                referralFee: formValues.hubForm.referralFee,
                uri: `https://arweave.net/${metadataResult}`,
              }

              const result = await hubInit(hubParams)
              if (result?.success) {
                enqueueSnackbar('Hub Created!', {
                  variant: 'success',
                })

                removeUpload(upload)
                setIsPublishing(false)
                setHubCreated(true)
                setHubPubkey(result.hubPubkey)
              } else {
                enqueueSnackbar('Hub Not Created', {
                  variant: 'error',
                })
              }
            }
          }
        } else {
          setFormValuesConfirmed(false)
        }
      }
    } catch (error) {
      setIsPublishing(false)
      console.warn(error)
    }
  }

  if (hubCreated) {
    return (
      <HubCreateSuccess
        hubName={formValues.hubForm.displayName}
        hubHandle={formValues.hubForm.handle}
        inHubs={inHubs}
      />
    )
  }

  return (
    <StyledGrid item md={12}>
      {!wallet.connected && (
        <ConnectMessage variant="body" gutterBottom>
          Please connect your wallet to create a hub
        </ConnectMessage>
      )}

      <NoSolWarning action={'hub'} open={open} setOpen={setOpen} />

      {update && (
        <Typography gutterBottom>
          Updating {hubData.data.displayName}
        </Typography>
      )}
      {!update && (
        <Typography variant="h3" gutterBottom>
          Create Hub
        </Typography>
      )}
      {wallet?.connected && (
        <NinaBox columns="500px" gridColumnGap="10px">
          <CreateFormWrapper>
            <HubCreateForm
              onChange={handleFormChange}
              values={formValues.hubForm}
              HubCreateSchema={HubCreateSchema}
              update={update}
              hubData={hubData}
            />

            <DropzoneWrapper>
              <ImageMediaDropzone
                setArtwork={setArtwork}
                type="artwork"
                currentImageUrl={update ? hubData.data.image : null}
                update={update}
                inHubCreate={true}
              />
            </DropzoneWrapper>

            <ColorWrapper>
              <ColorModal
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
                textColor={textColor}
                setTextColor={setTextColor}
                colorReset={colorReset}
              />

              {backgroundColor && (
                <Typography
                  mt={1}
                  style={{
                    borderLeft: `15px solid ${backgroundColor}`,
                    paddingLeft: '10px',
                  }}
                >
                  BackgroundColor: {backgroundColor}
                </Typography>
              )}
              {textColor && (
                <Typography
                  style={{
                    borderLeft: `15px solid ${textColor}`,
                    paddingLeft: '10px',
                  }}
                >
                  TextColor: {textColor}
                </Typography>
              )}
            </ColorWrapper>

            {formValues.hubForm.publishFee > 30 ||
              (formValues.hubForm.referralFee > 30 && (
                <Box>
                  <Warning variant="subtitle1">
                    Are you certain about the fees you set? High fees may
                    discourage potential collectors.
                  </Warning>
                </Box>
              ))}
          </CreateFormWrapper>

          <CreateCta>
            {bundlrBalance === 0 && <BundlrModal inCreate={true} />}

            {bundlrBalance > 0 &&
              formValuesConfirmed &&
              (update || isPublishing) && (
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
                    artwork?.meta.status === 'uploading'
                  }
                  sx={{ height: '54px' }}
                >
                  {isPublishing && <Dots msg={publishingStepText} />}
                  {!isPublishing && buttonText}
                </Button>
              )}

            {bundlrBalance > 0 && !formValuesConfirmed && (
              <HubCreateConfirm
                hubData={hubData}
                formValues={formValues}
                formIsValid={formIsValid}
                handleSubmit={handleSubmit}
                setFormValuesConfirmed={setFormValuesConfirmed}
                update={update}
                backgroundColor={backgroundColor}
                textColor={textColor}
              />
            )}

            <Box display="flex" justifyContent="space-between">
              {bundlrBalance > 0 && (
                <BundlrBalanceInfo variant="subtitle1" align="left">
                  Bundlr Balance: {bundlrBalance?.toFixed(4)} SOL / $
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
                  Upload Size: {uploadSize} MB
                </Typography>
              )}
            </Box>
          </CreateCta>
        </NinaBox>
      )}
    </StyledGrid>
  )
}

const StyledGrid = styled(Grid)(() => ({
  paddingTop: '20px',
  maxHeight: '90vh',
  overflowY: 'scroll',
  justifyContent: 'center',
  alignItems: 'center',
}))

const ConnectMessage = styled(Typography)(() => ({
  gridColumn: '1/3',
  paddingTop: '30px',
}))

const CreateFormWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '476px',
  margin: '0px auto ',
  display: 'flex',
  flexDirection: 'column',
  gridColumn: '1/3',
  border: `1px solid ${theme.palette.grey.primary}`,
  maxWidth: '506px',
}))

const CreateCta = styled(Box)(({ theme }) => ({
  gridColumn: '1/3',
  width: '100%',
  position: 'relative',
  '& .MuiButton-root': {
    ...theme.helpers.baseFont,
  },
}))

const DropzoneWrapper = styled(Box)(() => ({
  width: '100%',
  padding: '0 15px',
  display: 'flex',
}))

const BundlrBalanceInfo = styled(Typography)(() => ({
  whiteSpace: 'nowrap',
  margin: '5px 0',
}))

const ColorWrapper = styled(Box)(() => ({
  textAlign: 'left',
  padding: '5px 15px 15px',
}))

const Warning = styled(Typography)(({ theme }) => ({
  textTransform: 'none !important',
  color: theme.palette.red,
  opacity: '85%',
}))

export default HubCreate
