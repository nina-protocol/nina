import React from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

const ShareToTwitter = (props) => {
  const { artist, title, releasePubkey } = props
  return (
    <Button
      variant="outlined"
      onClick={() =>
        window.open(
          `https://twitter.com/intent/tweet?text=${`${artist} - "${title}" on @ninaprotocol`}&url=ninaprotocol.com/${releasePubkey}`,
          null,
          'status=no,location=no,toolbar=no,menubar=no,height=500,width=500'
        )
      }
      fullWidth
      sx={{
        mt: 1,
        '&:hover': {
          opacity: '50%',
        },
      }}
    >
      <StyledTypography variant="body2" align="left">
        Share To Twitter
      </StyledTypography>
    </Button>
  )
}

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.black,
}))

export default ShareToTwitter
