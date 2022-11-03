import React, { useState, useCallback, useEffect, useContext } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import { styled } from '@mui/material/styles'
import * as Yup from 'yup'
import EmailCaptureForm from './EmailCaptureForm'
import { Box } from '@mui/material'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
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

const EmailCapture = ({size}) => {
  const { publicKey, connected } = useWallet()
  const { submitEmailRequest } = useContext(Nina.Context)
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [formValues, setFormValues] = useState({})
  const [formIsValid, setFormIsValid] = useState(false)

  useEffect(() => {
    if (connected) {
      setFormValues({ ...formValues, wallet: publicKey.toString()} )
    }
  }, [connected, publicKey])

  const submitAndCloseModal = () => {
    handleSubmit()
    handleClose()
  }

  const handleSubmit = async () => {
    if (formIsValid) {
      submitEmailRequest(formValues)
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
    <div>
      {size === 'large' && (
        <BlueTypography
          variant="h1"
        >
          <a onClick={handleOpen}>Sign up</a> for a Hub {connected ? '' : 'or connect your wallet'} to get started.
        </BlueTypography>
      )}
      {size === 'medium' && (
        <BlueTypography
          onClick={handleOpen}
          variant="h3"
          sx={{ color: '#2D81FF', padding: { md: '10px 0 ', xs: '0px 0px' }, border: '1px solid #2D81FF', width: '100%', textAlign: 'center' }}
        >
          Please fill out this form to sign up for a Hub
        </BlueTypography>
      )}
      {size === 'small' && (
        <BlueTypography
          onClick={handleOpen}
          sx={{ padding: { md: '2px', xs: '0px 0px' }, border: '1px solid #2D81FF', width: '100%', textAlign: 'center' }}
        >
          Sign Up
        </BlueTypography>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant="h4" sx={{mb: 2}}>
            Nina is currently in closed beta.<br />  
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
            sx={{width: '400px', mt: 2}}
            disabled={!formIsValid}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </div>
  )
}

const BlueTypography = styled(Typography)(({ theme }) => ({
  '& a': {color: theme.palette.blue},
  'cursor': 'pointer'
}))

export default EmailCapture
