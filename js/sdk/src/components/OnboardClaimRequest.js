import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import EmailCapture from './EmailCapture'

import Collapse from '@mui/material/Collapse'

const OnboardClaimRequest = (props) => {
  const {wallet} = useContext(Wallet.Context)
  const {submitEmailRequest} = useContext(Nina.Context)
  const [open, setOpen] = useState(true)
  const [magicWallet, setMagicWallet] = useState(false)


  console.log('wallet here:>> ', wallet);
  

  const handleOpen = () => {
    setOpen(!open)
  }

  const handleClose = () => {
    setOpen(false)
  }

  
  return (
    <Root>
      <Button onClick={handleOpen}>
        <Typography variant="h4" sx={{mb:1}} >
          Request some SOL to get started
        </Typography>
      </Button>

      <Collapse in={open}>
        <EmailCapture size={'large'}/>
       </Collapse> 
    </Root>
  )
}

const Root = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  flexDirection: 'column',
}))



export default OnboardClaimRequest
