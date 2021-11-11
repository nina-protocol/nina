// tools
import React from "react"
import {styled} from '@mui/material/styles'
import {Dot} from 'react-animated-dots';



// return
const Dots = ({size}) => {
  return (
    <StyledDots size={size}>
      <Dot>•</Dot>
      <Dot>•</Dot>
      <Dot>•</Dot>
    </StyledDots>

  )
}

const StyledDots = styled('span', {
  shouldForwardProp: (prop) => prop,
})(({theme, size}) => ({
  color: theme.palette.purple,
  '& span': {
    fontSize: size ? size : 'inherit',
    borderRadius: '50%'
  }
}))



export default Dots;