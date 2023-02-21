import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
const BundlrModalBody = dynamic(() => import('./BundlrModalBody'), {})

const BundlrModal = ({ inCreate, displaySmall }) => {
  const [open, setOpen] = useState(false)

  return (
    <Root displaySmall={displaySmall}>
      {!inCreate && displaySmall && (
        <StyledSmallToggle
          align={'right'}
          variant="subtitle1"
          textTransform={'none'}
          onClick={() => setOpen(true)}
        >
          Manage Upload Account
        </StyledSmallToggle>
      )}
      {!inCreate && !displaySmall && (
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={() => setOpen(true)}
        >
          <Typography align={'right'} textTransform={'none'}>
            Manage Upload Account
          </Typography>
        </Button>
      )}
      {inCreate && (
        <Button
          variant="outlined"
          color="primary"
          type="submit"
          fullWidth
          onClick={() => setOpen(true)}
          sx={{ height: '54px' }}
        >
          <Typography
            align={displaySmall ? 'right' : 'left'}
            textTransform={'none'}
          >
            Click here to fund your Upload Account and start publishing
          </Typography>
        </Button>
      )}
      <BundlrModalBody open={open} setOpen={setOpen} lowUploadBalance={false} />
    </Root>
  )
}

const Root = styled('div')(({ displaySmall }) => ({
  display: 'flex',
  alignItems: displaySmall ? 'right' : 'center',
  width: displaySmall ? '' : '100%',
}))

const StyledSmallToggle = styled(Typography)(() => ({
  cursor: 'pointer',
  margin: '5px 0',
  textDecoration: 'underline',
  '&:hover': {
    opacity: '50%',
  },
}))

export default BundlrModal
