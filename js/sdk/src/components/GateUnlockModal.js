import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import LockIcon from '@mui/icons-material/Lock'
import CloseIcon from '@mui/icons-material/Close'
import Dots from './Dots'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import DownloadIcon from '@mui/icons-material/Download'
import IconButton from '@mui/material/IconButton'

const GateUnlockModal = ({ gates, amountHeld, unlockGate, inHubs }) => {
  const [open, setOpen] = useState(false)

  const [inProgress, setInProgress] = useState(false)
  const [activeIndex, setActiveIndex] = useState()

  const handleClose = () => {
    setOpen(false)
  }

  const handleUnlockGate = async (gate, index) => {
    setInProgress(true)
    setActiveIndex(index)
    try {
      await unlockGate(gate)
    } catch (error) {
      console.warn(error)
    }
    setInProgress(false)
    setActiveIndex()
  }
  return (
    <>
      <Root sx={{ mt: !inHubs ? 1 : 0 }}>
        <Button
          variant="outlined"
          color="primary"
          type="submit"
          onClick={() => setOpen(true)}
          sx={{
            height: '55px',
            width: '100%',
            '&:hover': {
              opacity: '50%',
            },
          }}
        >
          {' '}
          {amountHeld > 0 ? <LockOpenIcon /> : <LockIcon />}
        </Button>

        <StyledModal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={open}
          onClose={() => handleClose()}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={open}>
            <StyledPaper>
              <StyledCloseIcon onClick={() => handleClose()} />

              <>
                <StyledTypography variant="h5" sx={{ mb: 1 }}>
                  {amountHeld > 0
                    ? 'You have access to: '
                    : 'Purchase this release to download: '}
                </StyledTypography>
                <GateWrapper>
                  <List>
                    {gates.map((gate, index) => {
                      const fileSize = (gate.fileSize / (1024 * 1024)).toFixed(
                        2
                      )
                      return (
                        <ListItem
                          disableGutters
                          key={index}
                          secondaryAction={
                            <Box>
                              <IconButton
                                aria-label="delete"
                                disabled={
                                  amountHeld === 0 ||
                                  (inProgress && activeIndex === index)
                                }
                                onClick={() => {
                                  handleUnlockGate(gate, index)
                                }}
                              >
                                {inProgress && activeIndex === index ? (
                                  <Dots />
                                ) : (
                                  <DownloadIcon />
                                )}
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemButton disableGutters>
                            <ListItemText
                              primary={
                                <StyledTypography
                                  sx={{
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {gate.fileName} {`(${fileSize} mb)`}
                                </StyledTypography>
                              }
                              secondary={
                                <Box sx={{ wordBreak: 'break-word' }}>
                                  {gate.description}
                                </Box>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                  </List>
                </GateWrapper>
              </>
            </StyledPaper>
          </Fade>
        </StyledModal>
      </Root>
      {amountHeld === 0 && !inHubs && (
        <Box sx={{}}>
          <StyledTypographyButtonSub>
            {`There ${gates.length > 1 ? 'are' : 'is'} ${gates.length} ${
              gates.length > 1 ? 'files' : 'file'
            } available for download exclusively to owners of this release.`}
          </StyledTypographyButtonSub>
        </Box>
      )}
    </>
  )
}

const Root = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}))

const StyledTypographyButtonSub = styled(Typography)(({ theme }) => ({
  color: theme.palette.grey[500],
  textAlign: 'left',
  paddingTop: '8px',
  fontSize: '12px',
}))

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.black,
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
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    width: 'unset',
    margin: '15px',
    padding: theme.spacing(2),
  },
}))

const StyledCloseIcon = styled(CloseIcon)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.black,
  cursor: 'pointer',
}))

const GateWrapper = styled(Box)(() => ({
  maxHeight: '350px',
  overflowY: 'auto',
}))

export default GateUnlockModal
