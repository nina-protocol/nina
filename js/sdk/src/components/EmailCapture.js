import React, { useState, useCallback, useEffect, useContext } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import Link from 'next/link'
import { styled } from '@mui/system'

import * as Yup from 'yup'
import EmailCaptureForm from './EmailCaptureForm'
import { Box } from '@mui/material'
import Nina from '../contexts/Nina'
import Wallet from '../contexts/Wallet'
import Collapse from '@mui/material/Collapse'
import Dots from './Dots'

import { logEvent } from '../utils/event'

const style = {
  width: { xs: '88vw', md: '100%' },
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

const EmailCapture = ({
  setChildFormOpen,
  setParentOpen,
  forceOpen,
  inArtistProgram,
}) => {
  const { wallet } = useContext(Wallet.Context)
  const { enqueueSnackbar } = useSnackbar()
  const [usingMagicWallet, setUsingMagicWallet] = useState(false)
  const [user, setUser] = useState(undefined)
  const { publicKey, connected } = wallet
  const { submitEmailRequest, getVerificationsForUser, verificationState } =
    useContext(Nina.Context)
  const [open, setOpen] = useState(false)
  const [showSuccessInfo, setShowSuccessInfo] = useState(false)
  const [formValues, setFormValues] = useState({})
  const [formIsValid, setFormIsValid] = useState(false)
  const [submitButtonText, setSubmitButtonText] = useState('Submit')
  const [pending, setPending] = useState(false)
  const [userVerifications, setUserVerifications] = useState(undefined)
  const [soundcloudAccount, setSoundcloudAccount] = useState(undefined)
  const [twitterAccount, setTwitterAccount] = useState(undefined)

  useEffect(() => {
    if (connected) {
      setFormValues({ ...formValues, wallet: publicKey?.toString() })
      getVerificationsForUser(publicKey?.toString())
    }
  }, [connected, publicKey])

  useEffect(() => {
    if (verificationState[publicKey?.toString()]) {
      setUserVerifications(verificationState[publicKey?.toString()])
    }
  }, [verificationState, publicKey])

  useEffect(() => {
    if (wallet?.connected && wallet.wallet.adapter.name === 'Nina') {
      setUsingMagicWallet(true)
      setUser(wallet.wallet.adapter.user)
    }
  }, [wallet])

  useEffect(() => {
    if (formIsValid) {
      setSubmitButtonText('Submit')
    }
  }, [formValues])

  useEffect(() => {
    if (userVerifications) {
      setSoundcloudAccount(
        getVerificationValue(userVerifications, 'soundcloud')
      )
      setTwitterAccount(getVerificationValue(userVerifications, 'twitter'))
    }
  }, [userVerifications])

  useEffect(() => {
    if (forceOpen) {
      setOpen(true)
    }
  }, [forceOpen])

  const handleOpen = () => {
    setOpen(true)
    logEvent('email_request_initiated', 'engagement')
    if (!inArtistProgram) {
      setChildFormOpen(true)
    }
  }

  const handleClose = () => {
    setOpen(false)
    if (!inArtistProgram) {
      setChildFormOpen(false)
      setParentOpen(false)
    }
  }

  const handleSubmit = async () => {
    if (formIsValid) {
      setPending(true)
      try {
        const request = await submitEmailRequest(formValues)
        if (request) {
          setShowSuccessInfo(true)
          enqueueSnackbar('Email request submitted', { variant: 'success' })
        }
        logEvent('email_request_success', 'engagement', {
          email: formValues.email,
        })
      } catch (error) {
        console.warn('email form error', error)
        logEvent('email_request_error', 'engagement', {
          email: formValues.email,
        })
      }
      setPending(false)
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

  const getVerificationValue = (verifications, type) => {
    const verification = verifications?.find((verification) => {
      return verification.type === type
    })
    return verification?.value
  }

  return (
    <>
      {!open && (
        <Button onClick={handleOpen} variant="outlined" sx={{ mb: 1 }}>
          <Typography variant="body1">
            Request some SOL to get started
          </Typography>
        </Button>
      )}
      <Collapse in={open}>
        <Box sx={style}>
          {!showSuccessInfo && (
            <>
              {!inArtistProgram && (
                <Typography variant="h4" sx={{ mb: 1 }}>
                  Please provide a social account to submit a request for SOL.
                </Typography>
              )}

              {inArtistProgram && (
                <Typography variant="h4" sx={{ mb: 1 }}>
                  Please fill out this form and we will provide you with
                  everything needed to start uploading your music.
                </Typography>
              )}

              <EmailCaptureForm
                onChange={handleFormChange}
                values={formValues}
                EmailCaptureSchema={EmailCaptureSchema}
                usingMagicWallet={usingMagicWallet}
                wallet={wallet}
                user={user}
                soundcloudAccount={soundcloudAccount}
                twitterAccount={twitterAccount}
                publicKey={publicKey}
              />
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={async () => await handleSubmit()}
                sx={{ width: '100%', mt: '30px' }}
              >
                {!pending && (
                  <Typography graphy variant="body1">
                    {submitButtonText}
                  </Typography>
                )}
                {pending && <Dots size="40px" />}
              </Button>
            </>
          )}

          {showSuccessInfo && (
            <>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Thank you for requesting SOL to get started uploading on Nina.
              </Typography>

              <Typography variant="h4" sx={{ mb: 1 }}>
                Someone from our team will reach out to you via email in the
                next 2 - 3 days.
              </Typography>

              {!inArtistProgram && (
                <Button
                  variant="outlined"
                  style={{ width: '100%', marginTop: '5px' }}
                  onClick={handleClose}
                >
                  <Typography variant="body1">Okay</Typography>
                </Button>
              )}

              {inArtistProgram && (
                <Link href="/">
                  <StyledLink>
                    <Typography
                      variant="h4"
                      sx={{ textDecoration: 'underline' }}
                    >
                      Back to Home
                    </Typography>
                  </StyledLink>
                </Link>
              )}
            </>
          )}
        </Box>
      </Collapse>
    </>
  )
}

const StyledLink = styled('a')(({ theme }) => ({
  textDecoration: 'underline',
  color: theme.palette.blue,
  width: 'fit-content',
}))
export default EmailCapture
