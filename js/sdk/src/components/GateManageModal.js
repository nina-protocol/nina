import React, {useState, useEffect, useContext, useMemo} from 'react'
import {styled} from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import {encodeBase64} from 'tweetnacl-util'
import axios from 'axios'
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

import GateCreateModal from './GateCreateModal'
import Divider from '@mui/material/Divider';

import {useWallet} from '@solana/wallet-adapter-react'
import {useSnackbar} from 'notistack'
import Dots from './Dots'

const GateManageModal = ({handleFetchGates, metadata, releasePubkey, gates}) => {
  const [open, setOpen] = useState(false)
  const {enqueueSnackbar} = useSnackbar()
  const wallet = useWallet()
  const [inProgress, setInProgress] = useState(false)
  const [activeIndex, setActiveIndex] = useState()
  const [file, setFile] = useState(undefined)
  const [description, setDescription] = useState(undefined)
   
  const handleClose = () => {
    setOpen(false)
    setFile(undefined)
  }

  console.log('gates :>> ', gates);

  const handleDeleteGate = async (gate, index) => {
    setInProgress(true)
    setActiveIndex(index)
    try {
      console.log('releasePubkey :>> ', releasePubkey);
      console.log('gate :>> ', gate);
      const message = new TextEncoder().encode(releasePubkey)
      const messageBase64 = encodeBase64(message)
      const signature = await wallet.signMessage(message)
      const signatureBase64 = encodeBase64(signature)
      const result = await axios.delete(
        `${process.env.NINA_GATE_URL}/gate/${gate.id
        }?message=${encodeURIComponent(
          messageBase64
        )}&publicKey=${encodeURIComponent(
          wallet.publicKey.toBase58()
        )}&signature=${encodeURIComponent(signatureBase64)}`
      )
      await handleFetchGates(releasePubkey)

      enqueueSnackbar('Gate Deleted', {
        variant: 'info',
      })
      console.log('result :>> ', result);
    } 
    catch (error) {
      enqueueSnackbar('Gate Not Deleted', {
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
        sx={{height: '55px', width: '100%', mt: 1}}
      >
        <Typography variant="body2">Manage Gates</Typography>
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

            <Typography variant="h5" sx={{mb: 1}}>
              Gate Manager
            </Typography>

            <Box>
                <GateCreateModal
                  releasePubkey={releasePubkey}
                  handleFetchGates={handleFetchGates}
                  metadata={metadata}
                />
              <Typography variant="body1" sx={{my: 1}}>
                Existing Gates:
              </Typography>
              <List>
                {gates.map((gate, index) => {
                  const fileSize = (gate.fileSize / (1024 * 1024)).toFixed(2)
                  return(
                    <ListItem 
                      disableGutters

                      secondaryAction={
                        <IconButton aria-label="delete"
                          disabled={inProgress && activeIndex === index}
                          onClick={() => {
                            handleDeleteGate(gate, index)
                          }}
                        >
                          {
                          inProgress && activeIndex === index ?
                            <Dots />
                          :
                            <DeleteIcon />
                          }
                        </IconButton>
                      }
                    >
                      <ListItemButton>
                        <ListItemText primary={`${gate.fileName} (${fileSize} mb)`} />
                      </ListItemButton>
                    </ListItem>
                  )
                }
                  
                )}
              </List>
            </Box>
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const Root = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}))

const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledPaper = styled(Paper)(({theme}) => ({
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

const StyledCloseIcon = styled(CloseIcon)(({theme}) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(2),
}))

export default GateManageModal 
