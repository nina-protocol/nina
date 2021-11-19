import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import { styled } from '@mui/material/styles'

const MobileWalletModal = () => {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box sx={{ paddingRight: '15px' }}>
      <StyledButton onClick={handleOpen}>
        <Typography variant="body1">Connect Wallet</Typography>
      </StyledButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <StyledBox>
          <Typography
            align="center"
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Mobile Support Coming Soon
          </Typography>
        </StyledBox>
      </Modal>
    </Box>
  )
}

const StyledBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '70vw',
  bgcolor: 'background.paper',
  boxShadow: 24,
  padding: '60px 15px',
  textAlign: 'cnter',
  ...theme.helpers.gradient,
}))

const StyledButton = styled(Button)(({ theme }) => ({
  ...theme.helpers.baseFont,
  color: `${theme.palette.black}!important`,
  textTransform: 'capitalize !important',
  padding: '0 15px 0 !important',
}))

export default MobileWalletModal
