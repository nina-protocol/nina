import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import { CircularProgress } from '@mui/material'
import SquareForm from './SquareForm'

const { NinaContext, ReleaseContext } = ninaCommon.contexts
const { NinaClient } = ninaCommon.utils

const SquareModal = ({ buttonDisabled, releasePubkey, release }) => {
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
    <Root>
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
    </Root>
  )
}

const PREFIX = 'SquareModal'

const classes = {
  modal: `${PREFIX}-modal`,
  paper: `${PREFIX}-paper`,
}

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.modal}`]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  [`& .${classes.paper}`]: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}))

export default SquareModal
