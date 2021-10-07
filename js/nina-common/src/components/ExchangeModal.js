import { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, Box } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Fade from '@material-ui/core/Fade'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import 'react-tabs/style/react-tabs.css'
import NinaClient from '../utils/client'

const ExchangeModal = (props) => {
  const { toggleOverlay, showOverlay, amount, onSubmit, release, isAccept } =
    props
  const classes = useStyles()
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
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      open={showOverlay}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          toggleOverlay()
        }
      }}
      closeAfterTransition
      BackdropComponent={Backdrop}
      disableBackdropClick={true}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={showOverlay}>
        <Box className={classes.paper}>
          <Typography variant="overline">
            YOU ARE {isAccept ? 'SELLING' : 'CREATING A LISTING TO SELL'} 1 SOFT
            FOR {NinaClient.nativeToUiString(nativeAmount, release.paymentMint)}
            .
          </Typography>
          <Typography variant="subtitle" className={classes.receivingAmount}>
            {isAccept ? '' : 'UPON SALE '}YOU WILL RECEIVE ◎
            {NinaClient.nativeToUiString(sellerAmount, release.paymentMint)}.
          </Typography>
          <Typography variant="overline">
            THE ARTIST WILL RECEIVE A ROYALTY OF ◎
            {NinaClient.nativeToUiString(artistFee, release.paymentMint)} [
            {release.resalePercentage.toNumber() / 10000}%]
          </Typography>
          <Typography variant="overline">
            THE PROTOCOL WILL RECEIVE ◎
            {NinaClient.nativeToUiString(vaultFee, release.paymentMint)} [
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
    </Modal>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    margin: 'auto',
    position: 'absolute',
    zIndex: '10',
    backgroundColor: `${theme.vars.white}`,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '30px',
    textAlign: 'center',
  },
  confirm: {
    '&.Mui-disabled': {
      color: `white !important`,
    },
    width: '400px',
    margin: `${theme.spacing(1, 'auto')}`,
    color: `${theme.vars.blue} !important`,
    fontSize: '14px',
    fontWeight: '700',
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    boxShadow: theme.shadows[5],
    padding: theme.spacing(6, 6),
    width: '400px',
    maxHeight: '80vh',
    overflowY: 'auto',
    color: `${theme.vars.white}`,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    ...theme.helpers.gradient,
  },
  receivingAmount: {
    fontWeight: 'bold',
  },
  cancel: {
    color: `${theme.vars.white}`,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}))

export default ExchangeModal
