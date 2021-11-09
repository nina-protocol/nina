import React from 'react'
import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'

const ScrollablePageWrapper = ({children}) => {


  return (
    <ScrollablePage>
      {children}
    </ScrollablePage>
  )
}

const ScrollablePage= styled(Box)(() => ({
  width: '100%',
  paddingTop: '240px',
  overflowY: 'scroll',
  overflowX: 'hidden',
}))


export default ScrollablePageWrapper
