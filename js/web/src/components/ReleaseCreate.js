import React, { useState, useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
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

const { ReleaseSettings, Dots } = ninaCommon.components
const { ReleaseContext, NinaContext, ConnectionContext } = ninaCommon.contexts

const ReleaseCreateSchema = Yup.object().shape({
  artist: Yup.string().required('Artist Name is Required'),
  title: Yup.string().required('Title is Required'),
  description: Yup.string().required('Description is Required'),
  catalogNumber: Yup.string().required('Catalog Number is Required'),
  amount: Yup.number().required('Edition Amount is Required'),
  retailPrice: Yup.number().required('Sale Price is Required'),
  resalePercentage: Yup.number().required('Resale Percent Amount is Required'),
})

const ReleaseCreate = () => {
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const { releaseCreate, pressingState, resetPressingState, releaseState } =
    useContext(ReleaseContext)
  const { getNpcAmountHeld, npcAmountHeld } = useContext(NinaContext)
  const { healthOk } = useContext(ConnectionContext)
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

  useEffect(() => {
    return () => {
      resetPressingState()
    }
  }, [])

  useEffect(async () => {
    getNpcAmountHeld()
  }, [wallet?.connected])

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
        retailPrice: releaseForm.retailPrice,
        amount: releaseForm.amount,
        artistTokens: releaseForm.artistTokens,
        resalePercentage: releaseForm.resalePercentage,
        catalogNumber: releaseForm.catalogNumber,
      }
      const success = await releaseCreate(data)
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
      {npcAmountHeld >= 1 && !healthOk && (
        <NetworkDegradedMessage>
          <Typography variant="h4">{`The Solana network status is currently degraded - there's a chance your upload will fail.`}</Typography>
        </NetworkDegradedMessage>
      )}
      {npcAmountHeld < 1 && (
        <Box style={{ display: 'flex' }}>
          <NpcMessage>
            <Typography variant="h3">
              Currently, Nina Publishing Credits (NPCs) are required to access
              the publishing flow.
            </Typography>
            <Typography variant="h3">
              1 NPC allows the publishing of 1 Release.
            </Typography>
            <Typography variant="h3">
              If you don’t have a Solana wallet, please set one up at{' '}
              <a target="_blank" rel="noreferrer" href="https://phantom.app">
                phantom.app
              </a>
              .
            </Typography>
            <Typography variant="h3">
              Please fill out{' '}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://docs.google.com/forms/d/e/1FAIpQLSdj13RKQcw9GXv3A5U4ebJhzJjjfxzxuCtB092X4mkHm5XX0w/viewform"
              >
                this form
              </a>{' '}
              and we will notify you when your credits have been distributed.
            </Typography>

            <Typography variant="h3">
              Check our <a href="/faq">FAQ</a> or hit us at{' '}
              <a
                target="_blank"
                rel="noreferrer"
                href="href=mailto:artists@nina.market"
              >
                artists@nina.market
              </a>{' '}
              with any questions.
            </Typography>
          </NpcMessage>
        </Box>
      )}

      {!wallet.connected && (
        <ConnectMessage variant="body" gutterBottom>
          Please connect your wallet to start publishing
        </ConnectMessage>
      )}

      {wallet?.connected && npcAmountHeld > 0 && (
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

            <Typography
              align="left"
              variant="subtitle1"
              sx={{ paddingTop: '5px' }}
            >
              Nina Publishing Credits: {npcAmountHeld}
            </Typography>
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
