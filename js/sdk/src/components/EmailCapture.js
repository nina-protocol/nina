import React, { useState, useCallback, useEffect, useContext } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import { styled } from '@mui/material/styles'
import * as Yup from 'yup'
import EmailCaptureForm from './EmailCaptureForm'
import { Box } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import Nina from '../contexts/Nina'
import CloseIcon from '@mui/icons-material/Close'
import { logEvent } from '../utils/event'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '88vw', md: 400 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: '60px',
  boxSizing: 'content-box',
}
const requiredString = 'A Soundcloud, Twitter, or Instagram is required'

const EmailCaptureSchema = Yup.object().shape(
  {
    email: Yup.string().email().required('Email is Required'),
    soundcloud: Yup.string().test(
      'oneOfRequired',
      requiredString,
      (value, context) => {
        const { twitter, instagram } = context.parent
        return value || twitter || instagram
      }
    ),
    twitter: Yup.string().test(
      'oneOfRequired',
      requiredString,
      (value, context) => {
        const { soundcloud, instagram } = context.parent
        return value || soundcloud || instagram
      }
    ),
    instagram: Yup.string().test(
      'oneOfRequired',
      requiredString,
      (value, context) => {
        const { soundcloud, twitter } = context.parent
        return value || soundcloud || twitter
      }
    ),
    wallet: Yup.string(),
    type: Yup.string(),
  },
  [['soundcloud', 'twitter', 'instagram']]
)

const EmailCapture = ({ size }) => {
  const { publicKey, connected } = useWallet()
  const { submitEmailRequest } = useContext(Nina.Context)
  const [open, setOpen] = useState(false)
  const [showSuccessInfo, setShowSuccessInfo] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [formValues, setFormValues] = useState({})
  const [formIsValid, setFormIsValid] = useState(false)
  const [submitButtonText, setSubmitButtonText] = useState('Submit')

  useEffect(() => {
    if (open) {
      logEvent('email_request_initiated', 'engagement')
    }
  }, [open])

  useEffect(() => {
    if (connected) {
      setFormValues({ ...formValues, wallet: publicKey.toString() })
    }
  }, [connected, publicKey])

  useEffect(() => {
    if (formIsValid) {
      setSubmitButtonText('Submit')
    }
  }, [formValues])

  const handleSubmit = async () => {
    if (formIsValid) {
      setSubmitButtonText('Submitting...')
      try {
        await submitEmailRequest(formValues)
        logEvent('email_request_success', 'engagement', {
          email: formValues.email,
        })
        setShowSuccessInfo(true)
      } catch (error) {
        console.warn('email form error', error)
        logEvent('email_request_success', 'engagement', {
          email: formValues.email,
        })
      }
    }
    if (!formIsValid) {
      if (
        formValues.email === '' &&
        !formValues.soundcloud &&
        !formValues.twitter &&
        !formValues.instagram
      ) {
        setSubmitButtonText(
          'An email address and at least one social is required'
        )
      }
      if (
        formValues.email !== '' &&
        !formValues.soundcloud &&
        !formValues.twitter &&
        !formValues.instagram
      ) {
        setSubmitButtonText('At least one social is required')
      }
      if (
        formValues.email === '' &&
        (formValues.soundcloud || formValues.twitter || formValues.instagram)
      ) {
        setSubmitButtonText('An email address is required')
      }
    }
  }

  const handleFormChange = useCallback(
    async (values) => {
      const newValues = { ...formValues, ...values }
      const isValid = await EmailCaptureSchema.isValid(newValues)
      setFormIsValid(isValid)
      setFormValues(newValues)
    },
    [formValues]
  )

  return (
    <>
      {size === 'large' && (
        <BlueTypography
          onClick={handleOpen}
          variant="h1"
          sx={{ display: 'inline' }}
        >
          Sign Up
        </BlueTypography>
      )}
      {size === 'medium' && (
        <BlueTypography
          onClick={handleOpen}
          variant="h3"
          sx={{
            padding: { md: '10px 0 ', xs: '0px 0px' },
            border: '1px solid #2D81FF',
            width: '100%',
            textAlign: 'center',
          }}
        >
          Please fill out this form to apply
        </BlueTypography>
      )}
      {size === 'small' && <SmallCta onClick={handleOpen}>Sign Up</SmallCta>}
      {size === 'getStarted' && (
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Typography variant="h3">
            If this is your first time using Nina, you can{' '}
          </Typography>
          <BlueTypography variant="h3" onClick={handleOpen} ml={0.5}>
            Sign Up here.
          </BlueTypography>
        </Box>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <CloseIconWrapper onClick={handleClose}>
            <CloseIcon />
          </CloseIconWrapper>

          {!showSuccessInfo && (
            <>
              <Typography variant="h4" gutterBottom>
                Nina is currently in closed beta.
              </Typography>
              <Typography variant="h4" sx={{ mb: '16px' }}>
                Please sign up below.
              </Typography>

              <EmailCaptureForm
                onChange={handleFormChange}
                values={formValues}
                EmailCaptureSchema={EmailCaptureSchema}
              />
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={handleSubmit}
                sx={{ width: '100%', mt: '30px' }}
              >
                {submitButtonText}
              </Button>
            </>
          )}

          {showSuccessInfo && (
            <>
              <Typography variant="h4" sx={{ mb: '' }}>
                You have succesfully signed up to Nina (Beta).
              </Typography>

              <Typography variant="h4" sx={{ mb: 1 }}>
                Someone from our team will reach out to you via email in the
                next 2 - 3 days.
              </Typography>

              <Button
                variant="outlined"
                style={{ width: '100%', marginTop: '5px' }}
                onClick={handleClose}
              >
                <Typography variant="body1">Okay</Typography>
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </>
  )
}

const BlueTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.blue,
  cursor: 'pointer',
}))

const CloseIconWrapper = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    position: 'absolute',
    top: '15px',
    display: 'block',
  },
}))

const SmallCta = styled(Typography)(({ theme }) => ({
  color: theme.palette.blue,
  cursor: 'pointer',
  padding: '2px',
  border: '1px solid #2D81FF',
  width: '100%',
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    position: 'absolute',
    top: '75%',
    right: '15px',
    padding: '5px 0px',
    width: '95px',
  },
}))

export default EmailCapture
