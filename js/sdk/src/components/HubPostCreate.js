import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import * as Yup from 'yup'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import { useSnackbar } from 'notistack'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import HubPostCreateForm from './HubPostCreateForm'
import Grid from '@mui/material/Grid'
import BundlrModal from '@nina-protocol/nina-internal-sdk/esm/BundlrModal'
import { createUpload, removeUpload, UploadType } from '../utils/uploadManager'
import Dots from './Dots'

const PostCreateSchema = Yup.object().shape({
  title: Yup.string().required('Title is Required'),
  body: Yup.string().required('Body is Required'),
  reference: Yup.string(),
})

const HubPostCreate = ({
  update,
  hubPubkey,
  hubReleasesToReference,
  preloadedRelease,
  selectedHubId,
  setParentOpen,
  userHasHubs,
  inHubDashboard,
}) => {
  const { enqueueSnackbar } = useSnackbar()
  const { wallet, pendingTransactionMessage, shortPendingTransactionMessage } =
    useContext(Wallet.Context)
  const { postInitViaHub, hubState, getHubsForRelease } = useContext(
    Hub.Context
  )
  const hubData = useMemo(
    () => hubState[selectedHubId || hubPubkey],
    [hubState, hubPubkey, selectedHubId]
  )
  const {
    initBundlr,
    bundlrUpload,
    bundlrBalance,
    getBundlrBalance,
    getBundlrPricePerMb,
    bundlrPricePerMb,
    solPrice,
    getSolPrice,
    checkIfHasBalanceToCompleteAction,
    NinaProgramAction,
  } = useContext(Nina.Context)
  const [uploadSize] = useState()
  const [buttonText, setButtonText] = useState(
    update ? 'Update Post' : 'Create Post'
  )
  const [pending] = useState(false)
  const [formIsValid, setFormIsValid] = useState(false)
  const [formValues, setFormValues] = useState({
    postForm: {},
  })
  const [isPublishing, setIsPublishing] = useState(false)
  const [metadataTx, setMetadataTx] = useState()
  const [postCreated, setPostCreated] = useState(false)
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
    refreshBundlr()
  }, [])

  const refreshBundlr = async () => {
    await initBundlr()
    await getBundlrPricePerMb()
    await getBundlrBalance()
    await getSolPrice()
  }

  useEffect(() => {
    if (isPublishing) {
      if (!update) {
        if (!metadataTx) {
          setPublishingStepText(
            `1/2 Uploading Metadata.  ${pendingTransactionMessage}, do not close this window.`
          )
        } else {
          setPublishingStepText(
            `2/2 Finalizing Post.  ${pendingTransactionMessage}, do not close this window.`
          )
        }
      }
      //   else {
      //     if (!metadataTx) {
      //       setButtonText('Restart 2/3: Upload Metadata.')
      //     } else if (artworkTx && !metadataTx) {
      //       setButtonText('Restart 3/4: Upload Metadata.')
      //     } else if (artworkTx && metadataTx) {
      //       setButtonText('Restart 3/4: Finalize Hub')
      //     } else if (mbs < uploadSize) {
      //       setButtonText(
      //         `Release requires more storage than available in your bundlr account, please top up`
      //       )
      //     }
      //   }
    } else {
      setButtonText(
        preloadedRelease
          ? `Create Post on ${hubData?.data.displayName}`
          : `Create Post`
      )
    }
  }, [metadataTx, isPublishing, postCreated, bundlrBalance, hubData])

  const handleFormChange = useCallback(
    async (values) => {
      setFormValues({
        ...formValues,
        postForm: values,
      })
    },
    [formValues]
  )

  useEffect(() => {
    if (update) {
      setFormIsValid(true)
      return
    }
    const valid = async () => {
      const isValid = await PostCreateSchema.isValid(formValues.postForm, {
        abortEarly: true,
      })
      setFormIsValid(isValid)
    }
    valid()
  }, [formValues])

  const handleSubmit = async () => {
    try {
      const error = await checkIfHasBalanceToCompleteAction(
        formValues.postForm.reference
          ? NinaProgramAction.POST_INIT_VIA_HUB_WITH_REFERENCE_RELEASE
          : NinaProgramAction.POST_INIT_VIA_HUB
      )
      if (error) {
        enqueueSnackbar(error.msg, { variant: 'failure' })
        return
      }

      setPostCreated(false)

      if (update) {
        //update function
      } else {
        let upload = uploadId
        if (!uploadId) {
          setIsPublishing(true)
          enqueueSnackbar(
            `Uploading Post to Arweave. ${shortPendingTransactionMessage}`,
            {
              variant: 'info',
            }
          )
          let metadataResult = metadataTx
          const metadataJson = {
            title: formValues.postForm.title,
            body: formValues.postForm.body,
          }
          if (formValues.postForm.reference) {
            metadataJson.reference = formValues.postForm.reference
          }

          if (preloadedRelease) {
            metadataJson.reference = preloadedRelease
            formValues.postForm.reference = preloadedRelease
          }
          metadataResult = await bundlrUpload(
            new Blob([JSON.stringify(metadataJson)], {
              type: 'application/json',
            })
          )
          setMetadataTx(metadataResult)

          upload = createUpload(
            UploadType.metadata,
            metadataResult,
            formValues.postForm
          )
          setUploadId(upload)
          const uri = 'https://arweave.net/' + metadataResult
          const slug = `${hubData.handle
            .toLowerCase()
            .replace(' ', '_')}_${Math.round(new Date().getTime() / 1000)}`

          let result
          if (metadataJson.reference) {
            result = await postInitViaHub(
              selectedHubId || hubPubkey,
              slug,
              uri,
              metadataJson.reference
            )
          } else {
            result = await postInitViaHub(hubPubkey, slug, uri)
          }
          if (result?.success) {
            if (metadataJson.reference) {
              await getHubsForRelease(metadataJson.reference)
            }
            enqueueSnackbar(result.msg, {
              variant: 'info',
            })
          } else {
            enqueueSnackbar('Post not created', {
              variant: 'failure',
            })
          }
          setIsPublishing(false)
          removeUpload(upload)
          setUploadId()
          setMetadataTx()
          setPublishingStepText('Create Post')
          setFormValues({ postForm: {} })
          setPostCreated(true)
          setOpen(false)
          if (setParentOpen) {
            setParentOpen(false)
          }
        }
      }
    } catch (error) {
      console.warn(error)
      setIsPublishing(false)
      if (setParentOpen) {
        setParentOpen(false)
      }
      enqueueSnackbar(error.msg, {
        variant: 'failure',
      })
    }
  }

  return (
    <Root>
      <CreateCtaButton
        variant="outlined"
        fullWidth
        onClick={() => setOpen(true)}
        disabled={!selectedHubId || (preloadedRelease && !userHasHubs)}
      >
        <Typography>
          {preloadedRelease ? 'Create Text Post' : 'Publish a new post'}
        </Typography>
      </CreateCtaButton>
      <StyledModal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <StyledPaper>
            <Grid item md={12}>
              {wallet?.connected && (
                <Box margin="auto">
                  <PostFormWrapper>
                    <HubPostCreateForm
                      onChange={handleFormChange}
                      values={formValues.postForm}
                      PostCreateSchema={PostCreateSchema}
                      update={update}
                      hubData={hubData}
                      postCreated={postCreated}
                      hubReleasesToReference={hubReleasesToReference}
                      preloadedRelease={preloadedRelease}
                    />
                  </PostFormWrapper>

                  <CreateCta>
                    {bundlrBalance === 0 && <BundlrModal inCreate={true} />}
                    {bundlrBalance > 0 && (
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={
                          isPublishing ||
                          !formIsValid ||
                          (!preloadedRelease &&
                            !formValues.postForm.reference &&
                            !inHubDashboard) ||
                          bundlrBalance === 0 ||
                          mbs < uploadSize
                        }
                        sx={{ height: '54px' }}
                      >
                        {isPublishing ? (
                          <Dots msg={publishingStepText} />
                        ) : (
                          <StyledTypography
                            disabled={
                              isPublishing ||
                              !formIsValid ||
                              (!preloadedRelease &&
                                !formValues.postForm.reference &&
                                !inHubDashboard) ||
                              bundlrBalance === 0 ||
                              mbs < uploadSize
                            }
                            variant="body2"
                          >
                            {buttonText}
                          </StyledTypography>
                        )}
                      </Button>
                    )}

                    {pending && <LinearProgress variant="determinate" />}

                    <Box display="flex" justifyContent="space-between">
                      {bundlrBalance > 0 && (
                        <BundlrBalanceInfo variant="subtitle1" align="left">
                          Bundlr Balance: {bundlrBalance?.toFixed(4)} SOL / $
                          {bundlrUsdBalance.toFixed(2)} / {mbs?.toFixed(2)} MB
                          ($
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
                </Box>
              )}
            </Grid>
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const CreateCtaButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  ...theme.helpers.baseFont,
  marginTop: theme.spacing(1),
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '50%',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4),
  zIndex: '10',
}))

const PostFormWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '476px',
  margin: '24px auto',
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

const BundlrBalanceInfo = styled(Typography)(() => ({
  whiteSpace: 'nowrap',
  margin: '5px 0',
}))

const Root = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}))

const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledTypography = styled(Typography)(({ theme, disabled }) => ({
  color: disabled ? theme.palette.grey.primary : theme.palette.black,
}))

export default HubPostCreate
