import React from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

const ScrollablePageWrapper = ({ onScroll, children, paddingTop }) => {
  return <ScrollablePage onScroll={onScroll} paddingTop={paddingTop}>{children}</ScrollablePage>
}

const ScrollablePage = styled(Box)(({ theme, paddingTop }) => ({
  width: '100vw',
  paddingTop,
  overflowY: 'scroll',
  overflowX: 'hidden',
  [theme.breakpoints.down('md')]: {
    width: '100vw',
    padding: '100px 0px',
    overflowY: 'scroll',
  },
}))

export default ScrollablePageWrapper
