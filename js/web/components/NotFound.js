import React, { useEffect, useState, useContext } from 'react'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import axios from 'axios'

const NotFound = ({ path }) => {
  const [revalidationAttempted, setRevalidationAttemped] = useState(false)
  const revalidate = async (path) => {
    await axios.post(
      `${process.env.SERVERLESS_HOST}/api/revalidate?token=${process.env.REVALIDATE_TOKEN}`,
      {
        path,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }

  useEffect(() => {
    if (!revalidationAttempted) {
      revalidate(path)
      setRevalidationAttemped(true)
    }
  }, [revalidationAttempted, path])

  return (
    <StyledBox>
      <Typography variant="h2" align="left">
        There was a problem loading the Release.
      </Typography>
      <BlueTypography
        variant="h2"
        align="left"
        sx={{ mt: '15px', color: `palette.blue` }}
      >
        <Link href={path}>Retry?</Link>
      </BlueTypography>
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
