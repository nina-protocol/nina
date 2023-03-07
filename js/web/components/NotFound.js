import React from 'react'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Link from 'next/link'

const NotFound = (props) => {
  return (
    <StyledBox>
      <Typography variant="h2" align="left">
        There&apos;s nothing here...
      </Typography>

      <BlueTypography
        variant="h2"
        align="left"
        sx={{ mt: '15px', color: `palette.blue` }}
      >
        <Link href="/releases">
          <a>Explore all Releases</a>
        </Link>
      </BlueTypography>
    </StyledBox>
  )
}

const StyledBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  flexDirection: 'column',
}))

export default NotFound

const BlueTypography = styled(Typography)(({ theme }) => ({
  '& a': { color: theme.palette.blue },
}))
