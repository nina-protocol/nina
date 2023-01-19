import React, { useState, useEffect, useContext, useMemo } from 'react'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import CloseIcon from '@mui/icons-material/Close'
import { encodeBase64 } from 'tweetnacl-util'
import axios from 'axios'

import { useWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import Dots from './Dots'
import HubPostCreate from './HubPostCreate'
import { display } from '@mui/system'

const CreateGateModal = ({ getGate, metadata, releasePubkey }) => {
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const { checkIfHasBalanceToCompleteAction, NinaProgramAction } = useContext(
    Nina.Context
  )
  const [inProgress, setInProgress] = useState(false)
  const [file, setFile] = useState(undefined)

  const handleClose = () => {
    setOpen(false)
    setFile(undefined)
  }

  const handleFileUpload = async () => {
    setInProgress(true)
    try {
      const FILE_CHUNK_SIZE = 10_000_000

      const message = new TextEncoder().encode(releasePubkey)
      const messageBase64 = encodeBase64(message)
      const signature = await wallet.signMessage(message)
      const signatureBase64 = encodeBase64(signature)

      const response = await axios.post(`${process.env.NINA_GATE_URL}/gate`, {
        fileSize: file.size,
        fileName: file.name,
        publicKey: wallet.publicKey.toBase58(),
        message: messageBase64,
        signature: signatureBase64,
        release: releasePubkey,
      })

      const { urls, UploadId } = response.data
      console.log('urls: ', urls)
      const uploader = axios.create()
      delete uploader.defaults.headers.put['Content-Type']

      const keys = Object.keys(urls)
      const promises = []

      for (const indexStr of keys) {
        const index = parseInt(indexStr)
        const start = index * FILE_CHUNK_SIZE
        const end = (index + 1) * FILE_CHUNK_SIZE
        const blob =
          index < keys.length ? file.slice(start, end) : file.slice(start)

        promises.push(axios.put(urls[index], blob))
      }

      const resParts = await Promise.all(promises)
      const result = resParts.map((part, index) => ({
        ETag: part.headers.etag,
        PartNumber: index + 1,
      }))

      const completeResponse = await axios.post(
        `${process.env.NINA_GATE_URL}/gate/finalize`,
        {
          UploadId,
          releasePublicKey: releasePubkey,
          fileName: file.name,
          fileSize: file.size,
          parts: result,
        }
      )

      await getGate()
      console.log('completeResponse: ', completeResponse.data)
      enqueueSnackbar('Gate Created', {
        variant: 'info',
      })
    } catch (err) {
      console.log(err)
      enqueueSnackbar('Gate Not Created', {
        variant: 'failure',
      })
    }
    setInProgress(false)
  }

  return (
    <Root>
      <Button
        variant="outlined"
        color="primary"
        type="submit"
        onClick={() => setOpen(true)}
        sx={{ height: '55px', width: '100%', mt: 1 }}
      >
        <Typography variant="body2">Create a Gate for this Release</Typography>
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

            <Typography variant="h5" sx={{ mb: 1 }}>
              Select a file or zip to be gated behind:
            </Typography>
            <Typography variant="h5" sx={{ mb: 2 }}>
              &apos;{metadata.name}&apos;
            </Typography>

            <Button component="label" variant="outlined">
              {!file ? 'Choose File' : file.name}
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </Button>

            {file && (
              <Button
                variant="outlined"
                sx={{ mt: 1 }}
                onClick={handleFileUpload}
              >
                {!inProgress ? 'Create Gate' : <Dots size="50px" />}
              </Button>
            )}
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const Root = styled('div')(({ theme }) => ({
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
  top: theme.spacing(2),
}))

export default CreateGateModal
