import React, { useState, useContext } from 'react'
import axios from 'axios'
import { encodeBase64 } from 'tweetnacl-util'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import Modal from '@mui/material/Modal'
import Paper from '@mui/material/Paper'
import Backdrop from '@mui/material/Backdrop'
import { styled } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import { useSnackbar } from 'notistack'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import { logEvent } from '@nina-protocol/nina-internal-sdk/src/utils/event'
import Dots from './Dots'

const ReleaseCode = ({ release, releasePubkey }) => {
  const { pendingTransactionMessage } = useContext(Wallet.Context)

  const [codes, setCodes] = useState()
  const [amount, setAmount] = useState()
  const { wallet } = useContext(Wallet.Context)
  const { enqueueSnackbar } = useSnackbar()
  const [open, setOpen] = useState(false)
  const [pendingCodes, setPendingCodes] = useState(false)
  const [pendingFetchCodes, setPendingFetchCodes] = useState(false)

  const handleGenerateCodes = async (e) => {
    e.preventDefault()
    try {
      setPendingCodes(true)
      const message = new TextEncoder().encode(releasePubkey)
      const messageBase64 = encodeBase64(message)
      const signature = await wallet.signMessage(message)
      const signatureBase64 = encodeBase64(signature)

      logEvent('release_code_create_initiated', 'engagement', {
        wallet: wallet?.publicKey?.toBase58(),
        publicKey: releasePubkey,
      })

      const response = await axios.post(
        `${process.env.NINA_IDENTITY_ENDPOINT}/releaseCodes`,
        {
          message: messageBase64,
          signature: signatureBase64,
          publicKey: wallet.publicKey.toBase58(),
          release: releasePubkey,
          amount: Number(amount),
        }
      )

      logEvent('release_code_create_success', 'engagement', {
        wallet: wallet?.publicKey?.toBase58(),
        publicKey: releasePubkey,
      })

      if (response.data) {
        setCodes(response.data.codes)
        setPendingCodes(false)
        setAmount('')
      }
    } catch (error) {
      logEvent('release_code_create_failure', 'engagement', {
        wallet: wallet?.publicKey?.toBase58(),
        publicKey: releasePubkey,
      })

      enqueueSnackbar('Error generating codes', {
        variant: 'error',
      })
      setPendingCodes(false)
      console.error(error)
    }
  }

  const handleGetExistingCodes = async () => {
    try {
      setPendingFetchCodes(true)
      const message = new TextEncoder().encode(releasePubkey)
      const messageBase64 = encodeBase64(message)
      const signature = await wallet.signMessage(message)
      const signatureBase64 = encodeBase64(signature)

      const response = await axios.get(
        `${process.env.NINA_IDENTITY_ENDPOINT}/releases/${encodeURIComponent(
          releasePubkey
        )}/releaseCodes?message=${encodeURIComponent(
          messageBase64
        )}&signature=${encodeURIComponent(
          signatureBase64
        )}&publicKey=${encodeURIComponent(wallet.publicKey.toBase58())}`
      )
      if (response.data) {
        setCodes(response.data.codes)
        setPendingFetchCodes(false)
      }
    } catch (error) {
      enqueueSnackbar('Error fetching codes', {
        variant: 'error',
      })
      setPendingFetchCodes(false)
      console.error(error)
    }
  }
  return (
    <>
      <Root>
        <Button
          variant="outlined"
          onClick={() => setOpen(true)}
          disabled={release.remainingSupply === 0 || release.price === 0}
          fullWidth
          sx={{
            mt: 1,
            '&:hover': {
              opacity: '50%',
            },
          }}
        >
          <StyledTypography
            variant="body2"
            align="left"
            disabled={release.remainingSupply === 0 || release.price === 0}
          >
            Manage Release Codes
          </StyledTypography>
        </Button>
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
              <StyledCloseIcon onClick={() => setOpen(false)} />

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px 0px',
                }}
              >
                <form onSubmit={(e) => handleGenerateCodes(e)}>
                  <TextField
                    id="release-code"
                    label="Number of codes to generate:"
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    variant="standard"
                    fullWidth
                  />
                  <Button
                    variant="outlined"
                    type="submit"
                    fullWidth
                    disabled={!amount || amount == 0}
                    onClick={(e) => handleGenerateCodes(e)}
                    sx={{ marginTop: '15px' }}
                  >
                    {pendingCodes ? (
                      <Dots msg={pendingTransactionMessage} />
                    ) : (
                      <Typography variant="body2">
                        {amount > 1 || !amount || amount < 1
                          ? 'Generate Codes'
                          : 'Generate Code'}
                      </Typography>
                    )}
                  </Button>
                </form>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleGetExistingCodes()}
                  sx={{ marginTop: '15px' }}
                >
                  {pendingFetchCodes ? (
                    <Dots msg={pendingTransactionMessage} />
                  ) : (
                    <Typography variant="body2">Get Existing Codes</Typography>
                  )}
                </Button>
                {codes?.length == 0 && (
                  <Typography sx={{ marginTop: '15px' }}>
                    You have not generated any codes yet.
                  </Typography>
                )}
                {codes?.length > 0 && (
                  <>
                    <Typography sx={{ marginTop: '15px' }}>
                      You have generated the following codes:
                    </Typography>
                    <StyledList>
                      {codes.map((code) => {
                        return (
                          <StyledListItem
                            key={code.code}
                            className={code.claimedBy ? 'claimed' : ''}
                            gutterBottom
                          >
                            {code.code}
                          </StyledListItem>
                        )
                      })}
                    </StyledList>
                  </>
                )}
              </Box>
            </StyledPaper>
          </Fade>
        </StyledModal>
      </Root>
    </>
  )
}

const Root = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
}))

const StyledTypography = styled(Typography)(({ theme, disabled }) => ({
  color: disabled ? theme.palette.grey.primary : theme.palette.black,
}))

const StyledListItem = styled(ListItem)(() => ({
  listStyle: 'none',
  padding: '0px',
  marginTop: '15px',
  '&.claimed': {
    textDecoration: 'line-through',
  },
}))

const StyledList = styled(List)(() => ({
  width: '100%',
  maxHeight: '30vh',
  overflow: 'auto',
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

export default ReleaseCode
