import React, { useState, useContext, useEffect } from 'react'
import ninaCommon from 'nina-common'
import { useSnackbar } from 'notistack'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Typography } from '@material-ui/core'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { useWallet } from '@solana/wallet-adapter-react'
import ReleaseCreateForm from './ReleaseCreateForm'
import MediaUploadForm from './MediaUploadForm'
import MediaDropzones from './MediaDropzones'
import ReleaseCard from './ReleaseCard'

const { ReleaseSettings } = ninaCommon.components
const { ReleaseContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

const ReleaseCreate = () => {
  const classes = useStyles()
  const theme = useTheme()
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const { releaseCreate, pressingState, resetPressingState, releaseState } =
    useContext(ReleaseContext)
  const [track, setTrack] = useState(undefined)
  const [artwork, setArtwork] = useState()
  const [releasePubkey, setReleasePubkey] = useState(undefined)
  const [pressingFee, setPressingFee] = useState(undefined)
  const [release, setRelease] = useState(undefined)
  const [buttonText, setButtonText] = useState('Publish')
  const [pending, setPending] = useState(false)
  const [formValues, setFormValues] = useState({
    tokenForm: {},
    mediaForm: {},
  })

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

  useEffect(() => {
    async function calculateFee(artwork, track, tokenForm) {
      const { amount, retailPrice } = tokenForm

      const ninaVaultFee = NinaClient.pressingFeeCalculator(
        amount,
        0,
        retailPrice
      )
      setPressingFee(ninaVaultFee)
    }

    if (artwork && track && formValues.tokenForm) {
      calculateFee(artwork, track, formValues.tokenForm)
    }
  }, [track, artwork, formValues])

  function handleTokenFormChange(values) {
    setFormValues({
      ...formValues,
      tokenForm: values,
    })
  }

  function handleMediaFormChange(values) {
    setFormValues({
      ...formValues,
      mediaForm: values,
    })
  }

  const handleSubmit = async () => {
    if (track && artwork) {
      setPending(true)
      const { mediaForm, tokenForm } = formValues
      const data = {
        retailPrice: tokenForm.retailPrice,
        amount: tokenForm.amount,
        pressingFee,
        artistTokens: tokenForm.artistTokens,
        resalePercentage: tokenForm.resalePercentage,
        catalogNumber: tokenForm.catalogNumber,
        artist: mediaForm.artist,
        title: mediaForm.title,
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
      <div className={classes.createWrapper}>
        <Typography variant="h6" gutterBottom>
          Release Overview
        </Typography>
        <ReleaseSettings
          releasePubkey={releasePubkey}
          inCreateFlow={true}
          tempMetadata={formValues}
          artwork={artwork}
        />
      </div>
    )
  }

  return (
    <div className={classes.createWrapper}>
      <Typography variant="h6" gutterBottom>
        Upload
      </Typography>

      {wallet?.connected ? (
        <>
          <div style={theme.helpers.grid} className={classes.createFlowGrid}>
            <>
              <div className={classes.createFormContainer}>
                <MediaUploadForm
                  onChange={handleMediaFormChange}
                  catalogNumber={formValues.tokenForm.catalogNumber}
                  track={track}
                  artwork={artwork}
                  releasePubkey={releasePubkey}
                  resalePercentage={formValues.tokenForm.resalePercentage}
                />
                <ReleaseCreateForm
                  onChange={handleTokenFormChange}
                  values={formValues.tokenForm}
                />
                <MediaDropzones
                  setTrack={setTrack}
                  setArtwork={setArtwork}
                  values={formValues}
                  releasePubkey={releasePubkey}
                  track={track}
                />
                {pressingFee > 0 && (
                  <Typography variant="body2">
                    <strong>Pressing Fee:</strong> {pressingFee} (
                    {formValues.tokenForm.catalogNumber})
                  </Typography>
                )}
              </div>
              <div className={classes.createReleaseContainer}>
                <ReleaseCard
                  artwork={artwork}
                  metadata={{
                    ...formValues.mediaForm,
                    ...formValues.tokenForm,
                  }}
                  preview={true}
                  formValues={formValues}
                />
              </div>
            </>
            {!release && (
              <div className={classes.createCta}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={pending || !pressingFee}
                >
                  {pending && <CircularProgress />}
                  {!pending && buttonText}
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <Typography variant="body" gutterBottom>
          Please connect your wallet to start publishing!
        </Typography>
      )}
    </div>
  )
}

const useStyles = makeStyles(() => ({
  createWrapper: {
    width: '100%',
    position: 'absolute',
    top: 40,
  },
  createFlowGrid: {
    gridTemplateColumns: 'repeat(11, 1fr)',
  },
  createFormContainer: {
    gridColumn: '2/6',
    width: '100%',
  },
  createReleaseContainer: {
    gridColumn: '7/12',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  createCta: {
    gridColumn: '1/13',
    paddingTop: '0.5rem',
  },
}))

export default ReleaseCreate
