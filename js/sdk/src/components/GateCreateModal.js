import React, { useState } from 'react'
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
import TextField from '@mui/material/TextField'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import Dots from './Dots'

const GateCreateModal = ({
  fetchGatesForRelease,
  metadata,
  releasePubkey,
  gates,
}) => {
  const [open, setOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const [inProgress, setInProgress] = useState(false)
  const [file, setFile] = useState(undefined)
  const [description, setDescription] = useState(undefined)

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
      const sanitizedFileName = file.name.replaceAll(' ', '_')

      const response = await axios.post(`${process.env.NINA_GATE_URL}/gate`, {
        fileSize: file.size,
        fileName: sanitizedFileName,
        publicKey: wallet.publicKey.toBase58(),
        message: messageBase64,
        signature: signatureBase64,
        release: releasePubkey,
      })

      const { urls, UploadId } = response.data

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

      await axios.post(`${process.env.NINA_GATE_URL}/gate/finalize`, {
        UploadId,
        releasePublicKey: releasePubkey,
        fileName: sanitizedFileName,
        fileSize: file.size,
        parts: result,
        description,
      })

      await fetchGatesForRelease(releasePubkey)
      handleClose()
      enqueueSnackbar('Gate Created', {
        variant: 'info',
      })
    } catch (err) {
      enqueueSnackbar(`Gate Not Created: ${err.response.data.error}`, {
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
        sx={{
          height: '55px',
          width: '100%',
          mt: 1,
          '&:hover': {
            opacity: '50%',
          },
        }}
      >
        <StyledTypography variant="body2">
          {`Create ${
            gates?.length > 0 ? 'another' : 'a'
          } Gate for this Release`}
        </StyledTypography>
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
              Select a file to be available exclusively to collectors of
            </StyledTypography>
            <StyledTypography variant="h5">
              &apos;{metadata?.name}&apos;
            </StyledTypography>

            <TextField
              id="standard-multiline-static"
              label="Description"
              variant="standard"
              sx={{ mt: 2, mb: 2 }}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Button
              component="label"
              variant="outlined"
              sx={{
                '&:hover': {
                  opacity: '50%',
                },
              }}
            >
              {!file ? 'Choose File' : file.name}
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </Button>

            <Button
              variant="outlined"
              sx={{
                mt: 1,
                '&:hover': {
                  opacity: '50%',
                },
              }}
              onClick={handleFileUpload}
              disabled={!file || !description}
            >
              {!inProgress ? 'Create Gate' : <Dots size="50px" />}
            </Button>
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

export default GateCreateModal
