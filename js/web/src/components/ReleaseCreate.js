import React, { useState, useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { useSnackbar } from 'notistack'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { Typography, Box } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import ReleaseCreateForm from './ReleaseCreateForm'
import ReleaseCard from './ReleaseCard'
import NinaBox from './NinaBox'
import MediaDropzones from './MediaDropzones'
import * as Yup from 'yup'

const { ReleaseSettings } = ninaCommon.components
const { ReleaseContext, NinaContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

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
  const [track, setTrack] = useState(undefined)
  const [artwork, setArtwork] = useState()
  const [releasePubkey, setReleasePubkey] = useState(undefined)
  const [pressingFee, setPressingFee] = useState(undefined)
  const [release, setRelease] = useState(undefined)
  const [buttonText, setButtonText] = useState('1/2 Confirm Relase Info')
  const [pending, setPending] = useState(false)
  const [formIsValid, setFormIsValid] = useState(false)
  const [formValues, setFormValues] = useState({
    releaseForm: {},
  })

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

  useEffect(() => {
    const calculateFee = async (artwork, track, releaseForm) => {
      const { amount, retailPrice } = releaseForm

      const ninaVaultFee = NinaClient.pressingFeeCalculator(
        amount,
        0,
        retailPrice
      )
      setPressingFee(ninaVaultFee)
    }

    if (artwork && track && formValues.releaseForm) {
      calculateFee(artwork, track, formValues.releaseForm)
    }
  }, [track, artwork, formValues])

  const handleFormChange = async (values) => {
    setFormValues({
      ...formValues,
      releaseForm: values,
    })
    const valid = await ReleaseCreateSchema.isValid(formValues.releaseForm, {
      abortEarly: true,
    })
    setFormIsValid(valid)
  }

  const handleSubmit = async () => {
    if (track && artwork) {
      setPending(true)
      const { releaseForm } = formValues
      const data = {
        retailPrice: releaseForm.retailPrice,
        amount: releaseForm.amount,
        pressingFee,
        artistTokens: releaseForm.artistTokens,
        resalePercentage: releaseForm.resalePercentage,
        catalogNumber: releaseForm.catalogNumber,
      }
      const success = await releaseCreate(data, pressingFee)
      if (success) {
        enqueueSnackbar('Uploading metadata...', {
          variant: 'info',
        })
        await artwork.restart()
        enqueueSnackbar('Uploading track...', {
          variant: 'info',
        })
        await track.restart()
        enqueueSnackbar('Release created!', {
          variant: 'success',
        })
      } else {
        enqueueSnackbar('Unable to create Release', {
          variant: 'failure',
        })
        setPending(false)
      }
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
    <NinaBox columns="350px 400px" gridColumnGap="10px">
      {!wallet.connected && (
        <ConnectMessage variant="body" gutterBottom>
          Please connect your wallet to start publishing!
        </ConnectMessage>
      )}

      {wallet?.connected && npcAmountHeld > 0 && (
        <>
          <Box sx={{ width: '100%' }}>
            <MediaDropzones
              setTrack={setTrack}
              setArtwork={setArtwork}
              values={formValues}
              releasePubkey={releasePubkey}
              track={track}
            />
          </Box>

          <CreateFormWrapper>
            <ReleaseCreateForm
              onChange={handleFormChange}
              values={formValues.releaseForm}
              ReleaseCreateSchema={ReleaseCreateSchema}
              pressingFee={pressingFee}
            />
          </CreateFormWrapper>

          {!release && (
            <CreateCta>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleSubmit}
                disabled={pending || !pressingFee || !formIsValid}
                sx={{ height: '54px' }}
              >
                {pending && <CircularProgress />}
                {!pending && buttonText}
              </Button>
            </CreateCta>
          )}
        </>
      )}

      {wallet?.connected && npcAmountHeld < 1 && (
        <Typography variant="body" gutterBottom sx={{ gridColumn: '1/3' }}>
          Fill out this form to apply for a publishing grant
        </Typography>
      )}
    </NinaBox>
  )
}

const ConnectMessage = styled(Typography)(() => ({
  gridColumn: '1/3',
}))

const CreateFormWrapper = styled(Box)(({ theme }) => ({
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
  '& .MuiButton-root': {
    ...theme.helpers.baseFont
  }
}))

export default ReleaseCreate
