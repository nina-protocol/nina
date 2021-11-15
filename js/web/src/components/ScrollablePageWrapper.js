import React from 'react'
import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'

const ScrollablePageWrapper = ({ children }) => {
  return <ScrollablePage>{children}</ScrollablePage>
}

const ScrollablePage = styled(Box)(() => ({
  width: '100vw',
  padding: '210px 0',
  overflowY: 'scroll',
  overflowX: 'hidden',
}))

export default ScrollablePageWrapper
