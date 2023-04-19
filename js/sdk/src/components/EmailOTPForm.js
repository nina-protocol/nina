import React, { useState, Fragment } from 'react'
import { MuiOtpInput } from 'mui-one-time-password-input'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { Typography } from '@mui/material'
import Dots from './Dots'
import {fontSize} from '@material-ui/system'

export default function EmailOTP({ login, email, setPending, pending }) {
  const [passcode, setPasscode] = useState('')
  const [retries, setRetries] = useState(2)
  const [message, setMessage] = useState()
  const [disabled, setDisabled] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPending(true)
    // await autoSubmit(passcode);

    setDisabled(true)
    setRetries((r) => r - 1)
    // setPasscode("");

    // Send OTP for verification
    await login.emit('verify-email-otp', passcode)

    login.on('invalid-email-otp', () => {
      // User entered invalid OTP
      setDisabled(false)

      if (!retries) {
        setMessage('No more retries. Please try again later.')

        // Cancel the login
        login.emit('cancel')
      } else {
        // Prompt the user again for the OTP
        setMessage(
          `Incorrect code. Please enter OTP again. ${retries} ${
            retries === 1 ? 'retry' : 'retries'
          } left.`
        )
      }
    })
    setPending(false)
  }

  const autoSubmit = async (value, login) => {
    setPending(true)
    setDisabled(true)
    setRetries((r) => r - 1)
    // setPasscode("");
    const trimmedPasscode = value.replaceAll(/\s/g, '')
    console.log('trimmedPasscode :>> ', trimmedPasscode)
    // Send OTP for verification
    await login.emit('verify-email-otp', trimmedPasscode)

    login.on('invalid-email-otp', () => {
      // User entered invalid OTP
      setDisabled(false)

      if (!retries) {
        setMessage('No more retries. Please try again later.')

        // Cancel the login
        login.emit('cancel')
      } else {
        // Prompt the user again for the OTP
        setMessage(
          `Incorrect code. Please enter OTP again. ${retries} ${
            retries === 1 ? 'retry' : 'retries'
          } left.`
        )
      }
    })
  }

  const handleChange = (value) => {
    const trimmedValue = value.replace(/\s/g, '')
    setPasscode(trimmedValue)
  }

  const handleCancel = () => {
    login.emit('cancel')
    setDisabled(false)
    setPending(false)
    console.log('%cUser canceled login.', 'color: orange')
  }

  return (
    <Root id="otp-component">
      {signingUp && (
        <Typography variant="h3" style={{ marginBottom: '15px' }}>
          Your account was succesfully created.
        </Typography>
      )}
      <Typography variant="h3" style={{ marginBottom: '15px' }}>
        A one-time passcode was sent to <i>{email}</i>.
      </Typography>

      {message && (
        <div id="otp-message">
          <Typography variant="h6" gutterBottom>
            {message}
          </Typography>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <MuiOtpInput
          value={passcode}
          length={7}
          onChange={(e) => handleChange(e)}
          TextFieldsProps={{ type: 'number' }}
          type="number"
          onComplete={(value) => {
            autoSubmit(value, login)
          }}
        />
        <Ctas sx={{ my: 1 }}>
          <Button
            id="submit-otp"
            type="submit"
            variant="outlined"
            disabled={disabled}
            style={{ marginBottom: '15px' }}
          >
            {pending ? <Dots size="40px" /> : 'Continue'}
          </Button>
        </Ctas>
      </form>
    </Root>
  )
}

const Ctas = styled(Box)(() => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
}))

const Root = styled(Box)(() => ({
  '.MuiOtpInput-TextField': {
    '& input': {
      fontSize: '30px',
    },
  },
  '.MuiOtpInput-TextField:last-of-type': {
    display: 'none',
  },
  [theme.breakpoints.down('md')]: {
    '.MuiOtpInput-TextField': {
      '& input': {
        padding: theme.spacing(1, 0),
      }
    },

  },
}))
