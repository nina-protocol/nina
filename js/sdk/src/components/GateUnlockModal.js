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

const GateUnlockModal = ({ gates, amountHeld, unlockGate }) => {
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
      setOpen(false)
    } catch (error) {
      console.warn(error)
    }
    setInProgress(false)
    setActiveIndex()
  }

  return (
    <Root>
      <Button
        variant="outlined"
        color="primary"
        type="submit"
        onClick={() => setOpen(true)}
        sx={{ height: '55px', width: '100%' }}
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
              <Typography variant="h5" sx={{ mb: 1 }}>
                Here are the files that owning this release gives you access to:
              </Typography>
              <List>
                {gates.map((gate, index) => {
                  const fileSize = (gate.fileSize / (1024 * 1024)).toFixed(2)
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
                          primary={`${gate.fileName} (${fileSize} mb)`}
                          secondary={gate.description}
                        />
                      </ListItemButton>
                    </ListItem>
                  )
                })}
              </List>
            </>

            {amountHeld === 0 && (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {gates.length > 1
                    ? `Purchase this release to access ${gates.length} files.`
                    : ` Purchase this release to access additional content.`}
                </Typography>
              </>
            )}
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const Root = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
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
}))

export default GateUnlockModal
