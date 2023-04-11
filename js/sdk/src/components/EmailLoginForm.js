import React, { useState } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Dots from './Dots'

export default function EmailForm({
  handleEmailLoginCustom,
  pending,
  email,
  setEmail,
}) {
  const [placeholder, setPlaceholder] = useState('Enter your email')
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
      <form onSubmit={handleSubmit}>
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
          {pending ? <Dots size="30px" /> : 'Login'}
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
