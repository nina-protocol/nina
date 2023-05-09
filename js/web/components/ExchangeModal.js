import { useContext, useState } from 'react'
import { styled } from '@mui/material/styles'
import { Typography, Box } from '@mui/material'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import Modal from '@mui/material/Modal'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
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
  const { ninaClient } = useContext(Nina.Context)
  const [pendingConfirm, setPendingConfirm] = useState(false)
  const { pendingTransactionMessage } = useContext(Wallet.Context)
  const nativeAmount = isAccept
    ? amount
    : ninaClient.uiToNative(amount, release.paymentMint)
  const artistFee = (nativeAmount * release.resalePercentage) / 1000000
  const sellerAmount = nativeAmount - artistFee

  const handleSubmit = async (e) => {
    setPendingConfirm(true)
    await onSubmit(e, false)
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
            FOR {` ${ninaClient.nativeToUiString(amount, release.paymentMint)}`}
            .
          </Typography>
          <Typography variant="subtitle" className={classes.receivingAmount}>
            {isAccept ? '' : 'UPON SALE '}YOU WILL RECEIVE
            {` ${ninaClient.nativeToUiString(
              sellerAmount,
              release.paymentMint
            )}`}
            .
          </Typography>
          <Typography variant="overline">
            THE ARTIST WILL RECEIVE A ROYALTY OF
            {` ${ninaClient.nativeToUiString(
              artistFee,
              release.paymentMint
            )}`}{' '}
            [{release.resalePercentage / 10000}%]
          </Typography>
          <Button
            onClick={(e) => handleSubmit(e, false)}
            variant="contained"
            className={classes.confirm}
            disabled={pendingConfirm}
          >
            {pendingConfirm ? pendingTransactionMessage : 'Confirm'}
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
