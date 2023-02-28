import React, { useContext, useState } from 'react'
import Wallet from '../contexts/Wallet'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import { encodeBase64 } from 'tweetnacl-util'
import axios from 'axios'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import IconButton from '@mui/material/IconButton'

import GateCreateModal from './GateCreateModal'
import { logEvent } from '@nina-protocol/nina-internal-sdk/src/utils/event'
import { useSnackbar } from 'notistack'
import Dots from './Dots'

const GateManageModal = ({
  fetchGatesForRelease,
  metadata,
  releasePubkey,
  gates,
  unlockGate,
}) => {
  const { enqueueSnackbar } = useSnackbar()
  const { wallet } = useContext(Wallet.Context)
  const [, setFile] = useState(undefined)
  const [open, setOpen] = useState(false)
  const [inProgress, setInProgress] = useState(false)
  const [activeIndex, setActiveIndex] = useState()
  const [action, setAction] = useState(undefined)

  const handleClose = () => {
    setOpen(false)
    setFile(undefined)
  }

  const handleUnlockGate = async (gate, index) => {
    setInProgress(true)
    setActiveIndex(index)
    setAction('unlock')
    try {
      logEvent('unlock_gate_admin_init', 'engagement', {
        gateId: gate.id,
        publicKey: releasePubkey,
        wallet: wallet?.publicKey?.toBase58() || 'unknown',
      })
      await unlockGate(gate)
      logEvent('unlock_gate_admin_success', 'engagement', {
        gateId: gate.id,
        publicKey: releasePubkey,
        wallet: wallet?.publicKey?.toBase58() || 'unknown',
      })

      setOpen(false)
    } catch (error) {
      logEvent('unlock_gate_admin_failure', 'engagement', {
        gateId: gate.id,
        publicKey: releasePubkey,
        wallet: wallet?.publicKey?.toBase58() || 'unknown',
      })
      console.warn(error)
    }
    setInProgress(false)
    setActiveIndex()
  }

  const handleDeleteGate = async (gate, index) => {
    setInProgress(true)
    setActiveIndex(index)
    setAction('delete')
    try {
      logEvent('delete_gate_admin_init', 'engagement', {
        gateId: gate.id,
        publicKey: releasePubkey,
        wallet: wallet?.publicKey?.toBase58() || 'unknown',
      })
      const message = new TextEncoder().encode(releasePubkey)
      const messageBase64 = encodeBase64(message)
      const signature = await wallet.signMessage(message)
      const signatureBase64 = encodeBase64(signature)
      await axios.delete(
        `${process.env.NINA_GATE_URL}/gate/${
          gate.id
        }?message=${encodeURIComponent(
          messageBase64
        )}&publicKey=${encodeURIComponent(
          wallet.publicKey.toBase58()
        )}&signature=${encodeURIComponent(signatureBase64)}`
      )
      logEvent('delete_gate_admin_success', 'engagement', {
        gateId: gate.id,
        publicKey: releasePubkey,
        wallet: wallet?.publicKey?.toBase58() || 'unknown',
      })

      await fetchGatesForRelease(releasePubkey)
      enqueueSnackbar('Gate Deleted', {
        variant: 'info',
      })
    } catch (error) {
      logEvent('delete_gate_admin_failure', 'engagement', {
        gateId: gate.id,
        publicKey: releasePubkey,
        wallet: wallet?.publicKey?.toBase58() || 'unknown',
      })

      enqueueSnackbar(`Gate Not Deleted: ${error.response.data.error}`, {
        variant: 'failure',
      })
    }
    setInProgress(false)
    setActiveIndex(undefined)
  }

  return (
    <Root>
      <Button
        variant="outlined"
        color="primary"
        type="submit"
        onClick={() => setOpen(true)}
        sx={{
          height: '55px',
          width: '100%',
          mt: 1,
          '&:hover': {
            opacity: '50%',
          },
        }}
      >
        <StyledTypography variant="body2">Manage Gates</StyledTypography>
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

            <StyledTypography variant="h5" sx={{ mb: 1 }}>
              Gate Manager
            </StyledTypography>

            <Box>
              <GateCreateModal
                releasePubkey={releasePubkey}
                fetchGatesForRelease={fetchGatesForRelease}
                metadata={metadata}
                gates={gates}
              />

              {gates.length > 0 && (
                <StyledTypography variant="body1" sx={{ my: 1 }}>
                  Existing Gates:
                </StyledTypography>
              )}

              <GateWrapper>
                <List>
                  {gates.map((gate, index) => {
                    const fileSize = (gate.fileSize / (1024 * 1024)).toFixed(2)
                    return (
                      <ListItem
                        key={index}
                        disableGutters
                        secondaryAction={
                          <Box>
                            <IconButton
                              aria-label="delete"
                              disabled={inProgress && activeIndex === index}
                              onClick={() => {
                                handleUnlockGate(gate, index)
                              }}
                            >
                              {inProgress &&
                              activeIndex === index &&
                              action === 'unlock' ? (
                                <Dots />
                              ) : (
                                <DownloadIcon />
                              )}
                            </IconButton>

                            <IconButton
                              aria-label="delete"
                              disabled={inProgress && activeIndex === index}
                              onClick={() => {
                                handleDeleteGate(gate, index)
                              }}
                            >
                              {inProgress &&
                              activeIndex === index &&
                              action === 'delete' ? (
                                <Dots />
                              ) : (
                                <DeleteIcon />
                              )}
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemButton disableGutters>
                          <ListItemText
                            primary={
                              <StyledTypography>
                                {gate.fileName} ({`${fileSize} mb`})
                              </StyledTypography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    )
                  })}
                </List>
              </GateWrapper>
            </Box>
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

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.black,
}))

const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const GateWrapper = styled(Box)(() => ({
  maxHeight: '400px',
  overflowY: 'auto',
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
  cursor: 'pointer',
  color: theme.palette.black,
}))

export default GateManageModal
