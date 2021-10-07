import React, { useState, useContext } from 'react'
import { useSnackbar } from 'notistack'
import { makeStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import Button from '@material-ui/core/Button'
import RedeemableInitializeForm from './RedeemableInitializeForm'
import { ReleaseContext } from '../contexts'

const RedeemableInitialize = (props) => {
  const { releasePubkey, amount } = props
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const [redeemableInitValues, setRedeemableInitValues] = useState({})
  const { redeemableInitialize } = useContext(ReleaseContext)
  const { enqueueSnackbar } = useSnackbar()

  const handleRedeemableFormChange = (values, _errors) => {
    setRedeemableInitValues({
      ...redeemableInitValues,
      ...values,
    })
  }

  const submitRedeemableInitForm = async () => {
    const result = await redeemableInitialize(redeemableInitValues)
    if (result) {
      enqueueSnackbar(result.msg, {
        variant: result.success ? 'success' : 'warn',
      })
    }
    setOpen(false)
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        type="button"
        onClick={handleOpen}
        fullWidth
      >
        Create Redeemable
      </Button>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={classes.paper}>
            <RedeemableInitializeForm
              redeemableInitValues={redeemableInitValues}
              onChange={handleRedeemableFormChange}
              submitRedeemableInitForm={submitRedeemableInitForm}
              releasePubkey={releasePubkey}
              amount={amount}
            />
          </div>
        </Fade>
      </Modal>
    </div>
  )
}

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    width: '75%',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
}))

export default RedeemableInitialize
