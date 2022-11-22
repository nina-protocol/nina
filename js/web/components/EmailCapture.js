import React, { useState, useCallback, useEffect, useContext } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import { styled } from '@mui/material/styles'
import * as Yup from 'yup'
import EmailCaptureForm from './EmailCaptureForm'
import { Box } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import { useSnackbar } from 'notistack'
import CloseIcon from '@mui/icons-material/Close'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90vw', md: 400 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
}

const EmailCaptureSchema = Yup.object().shape({
  email: Yup.string().email().required('Email is Required'),
  soundcloud: Yup.string(),
  twitter: Yup.string(),
  instagram: Yup.string(),
  wallet: Yup.string(),
  type: Yup.string(),
})

const EmailCapture = ({ size }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { publicKey, connected } = useWallet()
  const { submitEmailRequest } = useContext(Nina.Context)
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [formValues, setFormValues] = useState({})
  const [formIsValid, setFormIsValid] = useState(false)

  useEffect(() => {
    if (connected) {
      setFormValues({ ...formValues, wallet: publicKey.toString() })
    }
  }, [connected, publicKey])

  const submitAndCloseModal = () => {
    handleSubmit()
    handleClose()
  }

  const handleSubmit = async () => {
    if (formIsValid) {
      submitEmailRequest(formValues)
      enqueueSnackbar('Application Submitted!', { variant: 'success' })
    }
  }

  const handleFormChange = useCallback(
    async (values) => {
      const newValues = { ...formValues, ...values }
      const isValid = await EmailCaptureSchema.isValid(newValues)
      setFormIsValid(isValid)
      setFormValues(newValues)
    },
    [formValues]
  )

  return (
    <>
      {size === 'large' && (
        <BlueTypography
          onClick={handleOpen}
          variant="h1"
          sx={{ display: 'inline' }}
        >
          Sign Up
        </BlueTypography>
      )}
      {size === 'medium' && (
        <BlueTypography
          onClick={handleOpen}
          variant="h3"
          sx={{
            padding: { md: '10px 0 ', xs: '0px 0px' },
            border: '1px solid #2D81FF',
            width: '100%',
            textAlign: 'center',
          }}
        >
          Please fill out this form to apply
        </BlueTypography>
      )}
      {size === 'small' && <SmallCta onClick={handleOpen}>Sign Up</SmallCta>}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <CloseIconWrapper onClick={handleClose}>
            <CloseIcon />
          </CloseIconWrapper>

          <Typography variant="h4">
            Nina is currently in closed beta.
          </Typography>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Please sign up below.
          </Typography>
          <EmailCaptureForm
            onChange={handleFormChange}
            values={formValues}
            EmailCaptureSchema={EmailCaptureSchema}
          />
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={submitAndCloseModal}
            sx={{ width: '100%', mt: 2 }}
            disabled={!formIsValid}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </>
  )
}

const BlueTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.blue,
  cursor: 'pointer',
}))

const CloseIconWrapper = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    position: 'absolute',
    top: '15px',
    display: 'block',
  },
}))

const SmallCta = styled(Typography)(({ theme }) => ({
  color: theme.palette.blue,
  cursor: 'pointer',
  padding: '2px',
  border: '1px solid #2D81FF',
  width: '100%',
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    position: 'absolute',
    top: '75%',
    right: '15px',
    padding: '5px 0px',
    width: '95px',
  },
}))

export default EmailCapture
