import React, { useState, useEffect, useContext } from 'react'
import ninaCommon from 'nina-common'
import { makeStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import Button from '@material-ui/core/Button'
import { CircularProgress } from '@material-ui/core'
import SquareForm from './SquareForm'

const { NinaContext, ReleaseContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

export default function SquareModal({
  buttonDisabled,
  releasePubkey,
  release,
}) {
  const classes = useStyles()
  const { getRelease } = useContext(ReleaseContext)
  const { addReleaseToCollection, getUsdcBalance } = useContext(NinaContext)
  const [open, setOpen] = useState(false)
  const [squareLoaded, setSquareLoaded] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js'
    script.async = true

    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    if (!squareLoaded && window.Square) {
      setSquareLoaded(true)
    }
  }, [window.Square])

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const updateStateAfterSquarePurchase = (releasePubkey) => {
    getUsdcBalance()
    getRelease(releasePubkey)
    addReleaseToCollection(releasePubkey)
  }

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        type="button"
        onClick={handleOpen}
        mt={2}
        disabled={buttonDisabled}
      >
        Buy{' '}
        {NinaClient.nativeToUiString(
          release.price.toNumber(),
          release.paymentMint
        )}{' '}
        Credit
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
            {!squareLoaded && <CircularProgress />}
            <SquareForm
              handleClose={handleClose}
              squareLoaded={squareLoaded}
              releasePubkey={releasePubkey}
              release={release}
              updateStateAfterSquarePurchase={updateStateAfterSquarePurchase}
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
  },
}))
