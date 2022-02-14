import React, { useState, useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import nina from "@nina-protocol/nina-sdk";
import { useSnackbar } from 'notistack'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import { Typography, Box } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import ReleaseCreateForm from './ReleaseCreateForm'
import ReleaseCard from './ReleaseCard'
import NinaBox from './NinaBox'
import MediaDropzones from './MediaDropzones'
import * as Yup from 'yup'
import { useRouter } from 'next/router'
import Dots from './Dots'
import ReleaseSettings from './ReleaseSettings'

const { HubContext, NinaContext, ReleaseContext } = nina.contexts

const ReleaseCreateSchema = Yup.object().shape({
  artist: Yup.string().required('Artist Name is Required'),
  title: Yup.string().required('Title is Required'),
  description: Yup.string().required('Description is Required'),
  catalogNumber: Yup.string().required('Catalog Number is Required'),
  amount: Yup.number().required('Edition Amount is Required'),
  retailPrice: Yup.number().required('Sale Price is Required'),
  resalePercentage: Yup.number().required('Resale Percent Amount is Required'),
})

const ReleaseCreateViaHub = () => {
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const hubPubkey = router.query.hubPubkey
  const wallet = useWallet()
  const { pressingState, resetPressingState, releaseState, releaseInitViaHub } =
    useContext(ReleaseContext)
  const { healthOk } = useContext(NinaContext)
  const { getHub, hubState } = useContext(HubContext)

  const [track, setTrack] = useState(undefined)
  const [artwork, setArtwork] = useState()
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

  const [hubData, setHubData] = useState(hubState[hubPubkey] || null)
  const [userIsCurator, setUserIsCurator] = useState(false)

  useEffect(() => {
    if (!hubData) {
      getHub(hubPubkey)
    }
  }, [])

  useEffect(() => {
    setHubData(hubState[hubPubkey])
  }, [hubState[hubPubkey]])

  useEffect(() => {
    if (wallet.connected) {
      if (wallet?.publicKey?.toBase58() === hubData?.curator.toBase58()) {
        setUserIsCurator(true)
      }
    }
  }, [hubData, wallet?.connected])

  useEffect(() => {
    return () => {
      resetPressingState()
    }
  }, [])

  useEffect(() => {
    if (pressingState.releasePubkey) {
      setReleasePubkey(pressingState.releasePubkey)
    }

    if (pressingState.completed) {
      setButtonText('View Your Release')
    }
  }, [pressingState])

  useEffect(() => {
    if (releasePubkey && releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey])
    }
  }, [releaseState.tokenData[releasePubkey]])

  const handleFormChange = async (values) => {
    setFormValues({
      ...formValues,
      releaseForm: values,
    })
  }

  useEffect(async () => {
    const valid = async () =>
      await ReleaseCreateSchema.isValid(formValues.releaseForm, {
        abortEarly: true,
      })
    setFormIsValid(await valid())
  }, [formValues])

  const handleSubmit = async () => {
    if (track && artwork) {
      setPending(true)
      const { releaseForm } = formValues
      const data = {
        hubPubkey: hubPubkey,
        retailPrice: releaseForm.retailPrice,
        amount: releaseForm.amount,
        artistTokens: releaseForm.artistTokens,
        resalePercentage: releaseForm.resalePercentage,
        catalogNumber: releaseForm.catalogNumber,
      }
      const success = await releaseInitViaHub(data)
      if (success) {
        enqueueSnackbar('Uploading metadata...', {
          variant: 'info',
        })
        await artwork.restart()
        enqueueSnackbar('Uploading track...', {
          variant: 'info',
        })
        await track.restart()
      } else {
        enqueueSnackbar('Unable to create Release', {
          variant: 'failure',
        })
        setPending(false)
      }
    }
  }

  const handleProgress = (progress, isImage) => {
    if (isImage) {
      setImageProgress(progress)
    } else {
      setAudioProgress(progress)
    }
  }

  if (
    release &&
    artwork.meta.status === 'done' &&
    track.meta.status === 'done'
  ) {
    return (
      <NinaBox columns={'repeat(2, 1fr)'} justifyItems={'end'}>
        <ReleaseCard
          metadata={formValues.releaseForm}
          preview={true}
          releasePubkey={releasePubkey}
          track={track}
          artwork={artwork}
        />
        <ReleaseSettings
          releasePubkey={releasePubkey}
          inCreateFlow={true}
          tempMetadata={formValues.releaseForm}
          artwork={artwork}
        />
      </NinaBox>
    )
  }

  return (
    <Box>
      {!healthOk && (
        <NetworkDegradedMessage>
          <Typography variant="h4">{`The Solana network status is currently degraded - there's a chance your upload will fail.`}</Typography>
        </NetworkDegradedMessage>
      )}

      {!wallet.connected && (
        <ConnectMessage variant="body" gutterBottom>
          Please connect your wallet to start publishing
        </ConnectMessage>
      )}

      {wallet?.connected && userIsCurator && (
        <NinaBox columns="350px 400px" gridColumnGap="10px">
          <Box sx={{ width: '100%' }}>
            <MediaDropzones
              setTrack={setTrack}
              setArtwork={setArtwork}
              values={formValues}
              releasePubkey={releasePubkey}
              track={track}
              handleProgress={handleProgress}
            />
          </Box>

          <CreateFormWrapper>
            <ReleaseCreateForm
              onChange={handleFormChange}
              values={formValues.releaseForm}
              ReleaseCreateSchema={ReleaseCreateSchema}
            />
          </CreateFormWrapper>

          <CreateCta>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={handleSubmit}
              disabled={
                pending ||
                !formIsValid ||
                artwork?.meta.status === 'uploading' ||
                track?.meta.status === 'uploading'
              }
              sx={{ height: '54px' }}
            >
              {pending && (
                <Dots
                  msg={`Uploading ${
                    audioProgress > 0 ? 'Track' : 'Image'
                  } - Please don't close this window`}
                />
              )}
              {!pending && buttonText}
            </Button>
            {pending && (
              <LinearProgress
                variant="determinate"
                value={audioProgress || imageProgress}
              />
            )}
          </CreateCta>
        </NinaBox>
      )}
    </Box>
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
  '& .MuiButton-root': {
    ...theme.helpers.baseFont,
  },
}))

const NetworkDegradedMessage = styled(Box)(({ theme }) => ({
  color: theme.palette.red,
  padding: '0 0 50px',
}))

export default ReleaseCreateViaHub
