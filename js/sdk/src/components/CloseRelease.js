import React, { useState, useContext } from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import Modal from '@mui/material/Modal'
import Paper from '@mui/material/Paper'
import Backdrop from '@mui/material/Backdrop'
import Dots from '@nina-protocol/nina-internal-sdk/esm/Dots'
import { useSnackbar } from 'notistack'
import Release from '../contexts/Release'
const CloseRelease = (props) => {
  const { release, inHubs, fullWidth, releasePubkey } = props
  const { enqueueSnackbar } = useSnackbar()
  const { closeRelease } = useContext(Release.Context)
  const [open, setOpen] = useState(false)
  const [pendingTx, setPendingTx] = useState(false)

  const handleCloseRelease = async (e, releasePubkey) => {
    e.preventDefault()
    setPendingTx(true)
    const result = await closeRelease(releasePubkey)

    if (result) {
      showCompletedTransaction(result)
      setPendingTx(false)
      setOpen(false)
    }
  }

  const showCompletedTransaction = (result) => {
    enqueueSnackbar(result.msg, {
      variant: result.success ? 'success' : 'warn',
    })
  }
  return (
    <>
      <Root inHubs={inHubs}>
        <CloseReleaseButton
          variant="outlined"
          onClick={() => setOpen(true)}
          disabled={release.remainingSupply === 0}
          fullWidth={fullWidth}
        >
          <CloseReleaseTypography
            variant="body2"
            align="left"
            closed={release.remainingSupply === 0}
          >
            Close Release
          </CloseReleaseTypography>
        </CloseReleaseButton>
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
              <StyledModalTypography
                align="center"
                variant="h5"
                id="transition-modal-title"
              >
                Are you sure you want to close this Release?
              </StyledModalTypography>
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
                onClick={(e) => handleCloseRelease(e, releasePubkey)}
                variant="outlined"
                color="primary"
                type="submit"
                fullWidth
              >
                <StyledModalButtonTypography>
                  {pendingTx && (
                    <Dots msg={'Closing release, please confirm in wallet '} />
                  )}
                  {!pendingTx && 'Close Release'}
                </StyledModalButtonTypography>
              </StyledModalButton>
            </StyledPaper>
          </Fade>
        </StyledModal>
      </Root>
    </>
  )
}

const Root = styled(Box)(({ inHubs }) => ({
  display: 'flex',
  alignItems: inHubs ? '' : 'center',
  justifyContent: inHubs ? '' : 'center',
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
  marginTop: '15px',
  color: theme.palette.black,
}))

const StyledModalWarningTypography = styled(Typography)(({ theme }) => ({
  marginTop: '15px',
  color: theme.palette.red,
}))

const StyledModalButton = styled(Button)(() => ({
  marginTop: '15px',
  '&:hover': {
    opacity: '50%',
  },
}))

const StyledModalButtonTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.red,
  fontSize: '12px',
  lineHeight: '13.8px',
}))

const CloseReleaseButton = styled(Button)(() => ({
  padding: '12px',
  marginTop: '15px',
  '&:hover': {
    opacity: '50%',
  },
}))

const CloseReleaseTypography = styled(Typography)(({ theme, closed }) => ({
  color: closed ? theme.palette.grey.primary : theme.palette.red,
}))

export default CloseRelease
