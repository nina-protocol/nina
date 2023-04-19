import React, { useState, useMemo } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Dots from './Dots'
import { Typography } from '@mui/material'

export default function EmailForm({
  handleEmailLoginCustom,
  email,
  setEmail,
  signingUp,
  pending,
  setPending,
}) {
  const [placeholder, setPlaceholder] = useState('Enter your email')
  const buttonText = useMemo(() => {
    return signingUp ? 'Create Account' : 'Continue'}
    , [signingUp] ) 
    
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      setPlaceholder('Please enter valid email')
      return
    }
    await handleEmailLoginCustom(email)
  }

  return (
    <LoginWrapper>
      <form onSubmit={async (e) => await handleSubmit(e)}>
        <TextField
          error={placeholder !== 'Enter your email'}
          type="email"
          name="email"
          id="email"
          placeholder={placeholder}
          value={email}
          variant="standard"
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button variant="outlined" type="submit">
<<<<<<< HEAD
          <Typography variant="body1" style={{ fontSize: '14px !important' }}>
=======
          <Typography variant='body1' style={{fontSize: '14px !important'}}>
>>>>>>> 308586862e63147ac08c500e60385d82b2e3dbd4
            {pending ? <Dots size="30px" /> : buttonText}
          </Typography>
        </Button>
      </form>
    </LoginWrapper>
  )
}

const LoginWrapper = styled(Box)(() => ({
  '& form': {
    display: 'flex',
    flexDirection: 'column',
  },
  '& button': {
    marginTop: '15px',
  },
}))
