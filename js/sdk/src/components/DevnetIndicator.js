import React from 'react'
import { styled } from '@mui/material/styles'

const DevnetIndicator = ({ devnet }) => {
  if (process.env.SOLANA_CLUSTER === 'devnet') {
    return <DevnetIndicatorStyled>[DEVNET]</DevnetIndicatorStyled>
  } else {
    return null
  }
}

const DevnetIndicatorStyled = styled('span')(({ theme }) => ({
  color: theme.palette.red,
  marginLeft: theme.spacing(1),
  fontFamily: 'monospace',
}))

export default DevnetIndicator
