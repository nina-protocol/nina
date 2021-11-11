import React from "react"
import {styled} from '@mui/material/styles'

const Dots = ({size}) => {
  return (
    <StyledDots size={size}>
      <span>•</span>
      <span>•</span>
      <span>•</span>
    </StyledDots>

  )
}

const StyledDots = styled('span', {
  shouldForwardProp: (prop) => prop,
})(({theme, size}) => ({
  color: theme.palette.purple,
  '& span': {
    fontSize: size ? size : 'inherit',
    borderRadius: '50%',
    animation: "blink 1s infinite",
    "&:nth-child(1)": {
      animationDelay: '0ms'
    },
    "&:nth-child(2)": {
      animationDelay: '250ms'
    },
    "&:nth-child(3)": {
      animationDelay: '5000ms'
    }
  },
  "@keyframes blink": {
   "50%": {
     color: 'transparent'
    }
  }
}))



export default Dots;