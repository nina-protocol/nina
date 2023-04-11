import React, { useState } from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {styled} from '@mui/material/styles'


export default function EmailForm({ handleEmailLoginCustom }) {
  const [email, setEmail] = useState();
  const [placeholder, setPlaceholder] = useState('Enter your email');

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      setPlaceholder('Please enter valid email');
      return;
    }
    handleEmailLoginCustom(email);
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
            <Button variant='outlined' type="submit" >Login</Button>
        </form>
      </LoginWrapper>
  );
}

const LoginWrapper = styled(Box)(({ theme }) => ({  
  '& form': {
    display: 'flex',
    flexDirection: 'column',
  },
  '& button': {
    marginTop: '15px',
  }
})) 