import { useState } from 'react'
import { styled } from '@mui/material/styles'
import { Typography, Box } from '@mui/material'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import Modal from '@mui/material/Modal'
import NinaClient from '../utils/client'

const ExchangeModal = (props) => {
  const {
    toggleOverlay,
    showOverlay,
    amount,
    onSubmit,
    release,
    isAccept,
    metadata,
  } = props

  const [pendingConfirm, setPendingConfirm] = useState(false)

  const nativeAmount = isAccept
    ? amount
    : NinaClient.uiToNative(amount, release.paymentMint)
  const artistFee =
    (nativeAmount * release.resalePercentage.toNumber()) / 1000000
  const vaultFee = (nativeAmount * NinaClient.NINA_VAULT_FEE) / 1000000
  const sellerAmount = nativeAmount - artistFee - vaultFee

  const handleSubmit = (e) => {
    setPendingConfirm(true)
    onSubmit(e, false)
  }

  return (
    <StyledModal // `disableBackdropClick` is removed by codemod.
      // You can find more details about this breaking change in [the migration guide](https://mui.com/guides/migration-v4/#modal)
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      open={showOverlay}
      onClose={() => {
        toggleOverlay()
      }}
    >
      <Fade in={showOverlay}>
        <Box className={classes.paper}>
          <Typography variant="overline">
            YOU ARE {isAccept ? 'SELLING' : 'CREATING A LISTING TO SELL'} 1{' '}
            {`${metadata?.symbol} `}
            FOR{' '}
            {` ${NinaClient.nativeToUiString(
              nativeAmount,
              release.paymentMint
            )}`}
            .
          </Typography>
          <Typography variant="subtitle" className={classes.receivingAmount}>
            {isAccept ? '' : 'UPON SALE '}YOU WILL RECEIVE
            {` ${NinaClient.nativeToUiString(
              sellerAmount,
              release.paymentMint
            )}`}
            .
          </Typography>
          <Typography variant="overline">
            THE ARTIST WILL RECEIVE A ROYALTY OF
            {` ${NinaClient.nativeToUiString(
              artistFee,
              release.paymentMint
            )}`}{' '}
            [{release.resalePercentage.toNumber() / 10000}%]
          </Typography>
          <Typography variant="overline">
            THE PROTOCOL WILL RECEIVE
            {` ${NinaClient.nativeToUiString(vaultFee, release.paymentMint)}`} [
            {NinaClient.NINA_VAULT_FEE / 10000}%]
          </Typography>
          <Button
            onClick={(e) => handleSubmit(e, false)}
            variant="contained"
            className={classes.confirm}
            disabled={pendingConfirm}
          >
            {pendingConfirm ? 'Please approve in your wallet' : 'Confirm'}
          </Button>
          <Typography
            variant="body1"
            className={classes.cancel}
            onClick={toggleOverlay}
          >
            close
          </Typography>
        </Box>
      </Fade>
    </StyledModal>
  )
}

const PREFIX = 'ExchangeModal'

const classes = {
  root: `${PREFIX}-root`,
  confirm: `${PREFIX}-confirm`,
  modal: `${PREFIX}-modal`,
  paper: `${PREFIX}-paper`,
  receivingAmount: `${PREFIX}-receivingAmount`,
  cancel: `${PREFIX}-cancel`,
}

const StyledModal = styled(Modal)(({ theme }) => ({
  width: '100%',
  height: '100%',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center',

  [`& .${classes.confirm}`]: {
    '&.Mui-disabled': {
      color: `white !important`,
    },
    width: '400px',
    margin: `${theme.spacing(1, 'auto')}`,
    color: `${theme.palette.blue} !important`,
    fontSize: '14px',
    fontWeight: '700',
  },

  [`&.${classes.modal}`]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  [`& .${classes.paper}`]: {
    boxShadow: theme.shadows[5],
    padding: theme.spacing(6, 6),
    width: '400px',
    maxHeight: '80vh',
    overflowY: 'auto',
    color: `${theme.palette.white}`,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    ...theme.gradient,
  },

  [`& .${classes.receivingAmount}`]: {
    fontWeight: 'bold',
  },

  [`& .${classes.cancel}`]: {
    color: `${theme.palette.white}`,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}))

export default ExchangeModal
