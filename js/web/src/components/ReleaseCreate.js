import React, { useState, useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { useSnackbar } from 'notistack'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { useWallet } from '@solana/wallet-adapter-react'
import ReleaseCreateForm from './ReleaseCreateForm'
import MediaDropzones from './MediaDropzones'
// import ReleaseCard from './ReleaseCard'
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
  const theme = useTheme()
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
  const [buttonText, setButtonText] = useState('Publish')
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
      <Root >
        <Typography variant="h6" gutterBottom>
          Release Overview
        </Typography>
        <ReleaseSettings
          releasePubkey={releasePubkey}
          inCreateFlow={true}
          tempMetadata={formValues.releaseForm}
          artwork={artwork}
        />
      </Root>
    )
  }

  return (
    <Root>
      {!wallet.connected && (
        <Typography variant="body" gutterBottom>
          Please connect your wallet to start publishing!
        </Typography>
      )}

      {wallet?.connected && npcAmountHeld > 0 && (
        <>
          <div style={theme.helpers.grid} className={classes.createFlowGrid}>
            <>
              <div className={classes.createReleasePreview}>
                {/* <ReleaseCard
                  artwork={artwork}
                  metadata={{
                    ...formValues.releaseForm,
                  }}
                  preview={true}
                  formValues={formValues}
                /> */}

                <MediaDropzones
                  setTrack={setTrack}
                  setArtwork={setArtwork}
                  values={formValues}
                  releasePubkey={releasePubkey}
                  track={track}
                />
              </div>
              <div className={classes.createFormContainer}>
                <ReleaseCreateForm
                  onChange={handleFormChange}
                  values={formValues.releaseForm}
                  ReleaseCreateSchema={ReleaseCreateSchema}
                />
                {pressingFee > 0 && (
                  <Typography variant="body2">
                    <strong>Pressing Fee:</strong> {pressingFee} (
                    {formValues.releaseForm.catalogNumber})
                  </Typography>
                )}
              </div>
        
            </>
            {!release && (
              <div className={classes.createCta}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={pending || !pressingFee || !formIsValid}
                >
                  {pending && <CircularProgress />}
                  {!pending && buttonText}
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {wallet?.connected && npcAmountHeld < 1 && (
        <Typography variant="body" gutterBottom>
          Fill out this form to apply for a publishing grant
        </Typography>
      )}
    </Root>
  )
}

const PREFIX = 'ReleaseCreate'

const classes = {
  createFlowGrid: `${PREFIX}-createFlowGrid`,
  createFormContainer: `${PREFIX}-createFormContainer`,
  createReleasePreview: `${PREFIX}-createReleasePreview`,
  createCta: `${PREFIX}-createCta`,
}

const Root = styled('div')(() => ({
  width: '100%',
  position: 'absolute',
  [`& .${classes.createFlowGrid}`]: {
    gridTemplateColumns: '50% 50%',
    gridAutoRows: 'auto !important',
    padding: '0 20%',
  },

  [`& .${classes.createFormContainer}`]: {
    width: '100%',
  },

  [`& .${classes.createReleasePreview}`]: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },

  [`& .${classes.createCta}`]: {
    gridColumn: '1/3',
    paddingTop: '0.5rem',
  },
}))

export default ReleaseCreate
