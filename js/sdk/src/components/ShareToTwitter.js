import React from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const ShareToTwitter = (props) => {
  const { artist, title, url } = props
  return (
    <Button
      variant="outlined"
      onClick={() =>
        window.open(
          `https://twitter.com/intent/tweet?text=${`${artist} - "${title}" on Nina`}&url=ninaprotocol.com/${url}`,
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
      <Typography variant="body2" align="left">
        Share To Twitter
      </Typography>
    </Button>
  )
}

export default ShareToTwitter
