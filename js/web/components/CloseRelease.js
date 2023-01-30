import React from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import Modal from '@mui/material/Modal'
import Paper from '@mui/material/Paper'
import Backdrop from '@mui/material/Backdrop'
import Dots from '@nina-protocol/nina-internal-sdk/esm/Dots'

const CloseRelease = (props) => {
  const { handleCloseRelease, open, setOpen, pendingTx, release } = props
  return (
    <>
      <Root>
        <StyledModal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={open}
          onClose={() => setOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={open}>
            <StyledPaper>
              <Typography
                align="center"
                variant="h5"
                id="transition-modal-title"
              >
                Are you sure you want to close this Release?
              </Typography>
              <StyledModalTypography
                align="center"
                variant="body1"
                id="transition-modal-description"
              >
                {`The release will no longer be available for primary sale and it will exist as an edition of ${release.saleCounter}.`}
              </StyledModalTypography>
              <StyledModalWarningTypography
                align="center"
                variant="body1"
                id="transition-modal-description"
              >
                This action is permanent and cannot be undone.
              </StyledModalWarningTypography>
              <Box display="flex" justifyContent="flex-end" mt={2} />
              <StyledModalButton
                onClick={handleCloseRelease}
                variant="outlined"
                color="primary"
                type="submit"
                fullWidth
                sx={{ marginTop: '' }}
              >
                <Typography variant="body2" sx={{ color: 'red' }}>
                  {pendingTx && (
                    <Dots msg={'Closing release, please confirm in wallet '} />
                  )}
                  {!pendingTx && 'Close Release'}
                </Typography>
              </StyledModalButton>
            </StyledPaper>
          </Fade>
        </StyledModal>
      </Root>
    </>
  )
}

const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
}))

const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  width: '40vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  zIndex: '10',
}))

const StyledModalTypography = styled(Typography)(({ theme }) => ({
  marginTop: '15px !important',
  color: 'black !important',
}))

const StyledModalWarningTypography = styled(Typography)(({ theme }) => ({
  marginTop: '15px !important',
  color: `${theme.palette.red} !important`,
}))

const StyledModalButton = styled(Button)(({ theme }) => ({
  marginTop: '15px !important',
}))

export default CloseRelease
