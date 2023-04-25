import React, { useState, useCallback, useEffect, useContext } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import { styled } from '@mui/material/styles'
import * as Yup from 'yup'
import EmailCaptureForm from './EmailCaptureForm'
import { Box } from '@mui/material'
import Nina from '../contexts/Nina'
import Wallet from '../contexts/Wallet'
import CloseIcon from '@mui/icons-material/Close'
import Collapse from '@mui/material/Collapse'

import { logEvent } from '../utils/event'

const style = {
  // position: 'absolute',
  // top: '50%',
  // left: '50%',
  // transform: 'translate(-50%, -50%)',
  width: { xs: '88vw', md: '100%' },
  // border: '2px solid blue',
  // bgcolor: 'background.paper',
  // boxShadow: 24,
  // p: '60px',
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

const EmailCapture = ({ setChildFormOpen, setParentOpen }) => {
  const { wallet } = useContext(Wallet.Context)
  const [usingMagicWallet, setUsingMagicWallet] = useState(false)
  const [user, setUser] = useState(undefined)
  const { publicKey, connected } = wallet
  const { submitEmailRequest } = useContext(Nina.Context)
  const [open, setOpen] = useState(false)
  const [showSuccessInfo, setShowSuccessInfo] = useState(false)
  const [formValues, setFormValues] = useState({})
  const [formIsValid, setFormIsValid] = useState(false)
  const [submitButtonText, setSubmitButtonText] = useState('Submit')

  // useEffect(() => {
  //   if (open) {
  //     logEvent('email_request_initiated', 'engagement')
  //   }
  // }, [open])

  useEffect(() => {
    if (connected) {
      setFormValues({ ...formValues, wallet: publicKey?.toString() })
    }
  }, [connected, publicKey])

  useEffect(() => {
    if (wallet.wallet.adapter.name === 'Nina') {
      setUsingMagicWallet(true)
      setUser(wallet.wallet.adapter.user)
    }
  }, [wallet])

  useEffect(() => {
    if (formIsValid) {
      setSubmitButtonText('Submit')
    }
  }, [formValues])

  const handleOpen = () => {
    setOpen(true)
    logEvent('email_request_initiated', 'engagement')
    setChildFormOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setChildFormOpen(false)
    setParentOpen(false)
  }

  const handleSubmit = async () => {
    if (formIsValid) {
      setSubmitButtonText('Submitting...')
      try {
        await submitEmailRequest(formValues)
        logEvent('email_request_success', 'engagement', {
          email: formValues.email,
        })
        console.log('SUCCESS');
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
      {!open && (
        <Button 
          onClick={handleOpen}
          variant="outlined"
          sx={{mb: 1}}
        >
          <Typography variant="body1" >
            Request some SOL to get started
          </Typography>
        </Button>
      )}
      <Collapse in={open}>
        <Box sx={style}>
          {!showSuccessInfo && (
            <>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Please provide one Social account to submit a request for a Sol grant.
               </Typography> 

              <EmailCaptureForm
                onChange={handleFormChange}
                values={formValues}
                EmailCaptureSchema={EmailCaptureSchema}
                usingMagicWallet={usingMagicWallet}
                wallet={wallet}
                user={user}
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
        </Collapse>
    </>
  )
}


// const CloseIconWrapper = styled(Box)(({ theme }) => ({
//   display: 'none',
//   [theme.breakpoints.down('md')]: {
//     position: 'absolute',
//     top: '15px',
//     display: 'block',
//   },
// }))


export default EmailCapture
