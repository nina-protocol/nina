import React, { useState, useCallback, useEffect, useContext } from 'react'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import * as Yup from 'yup'
// import EmailCaptureForm from './EmailCaptureForm'
import { Box } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { useSnackbar } from 'notistack'
import { logEvent } from '@nina-protocol/nina-internal-sdk/src/utils/event'
import EmailCapture from '@nina-protocol/nina-internal-sdk/esm/EmailCapture'
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90vw', md: 400 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
}
const requiredString =
  'At least one of Soundcloud, Twitter, or Instagram is required'

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

const EmailCaptureModal = ({ size }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { publicKey, connected } = useWallet()
  const { submitEmailRequest } = useContext(Nina.Context)
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [formValues, setFormValues] = useState({})
  const [formIsValid, setFormIsValid] = useState(false)

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

  const submitAndCloseModal = () => {
    handleSubmit()
    handleClose()
  }

  const handleSubmit = async () => {
    if (formIsValid) {
      try {
        submitEmailRequest(formValues)
        logEvent('email_request_success', 'engagement', {
          email: formValues.email,
        })
        enqueueSnackbar('Application Submitted!', { variant: 'success' })
      } catch (error) {
        console.warn('email form error', error)
        logEvent('email_request_success', 'engagement', {
          email: formValues.email,
        })
      }
    }
  }

  const handleFormChange = useCallback(
    async (values) => {
      const newValues = { ...formValues, ...values }
      console.log('newValues', newValues)
      const isValid = await EmailCaptureSchema.isValid(newValues)
      console.log('isValid', isValid)
      setFormIsValid(isValid)
      setFormValues(newValues)
    },
    [formValues]
  )

  return (
    <>
      <EmailCapture
        size={size}
        onClick={handleOpen}
        open={open}
        handleOpen={handleOpen}
        handleClose={handleClose}
        handleFormChange={handleFormChange}
        formValues={formValues}
        submitAndCloseModal={submitAndCloseModal}
        formIsValid={formIsValid}
      />
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

export default EmailCaptureModal
