import React from 'react'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

const Dots = ({ size, msg }) => {
  return (
    <StyledDots size={size}>
      {msg && (
        <Typography variant="body2" style={{ paddingRight: '2px' }}>
          {msg}
        </Typography>
      )}
      <span>•</span>
      <span>•</span>
      <span>•</span>
    </StyledDots>
  )
}

const StyledDots = styled('span', {
  shouldForwardProp: (prop) => prop,
})(({ theme, size }) => ({
  color: theme.palette.blue,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& span': {
    fontSize: size ? size : 'inherit',
    borderRadius: '50%',
    animation: 'blink 1s infinite',
    '&:nth-of-type(1)': {
      animationDelay: '0ms',
    },
    '&:nth-of-type(2)': {
      animationDelay: '250ms',
    },
    '&:nth-of-type(3)': {
      animationDelay: '5000ms',
    },
  },
  '@keyframes blink': {
    '50%': {
      color: 'transparent',
    },
  },
}))

export default Dots
