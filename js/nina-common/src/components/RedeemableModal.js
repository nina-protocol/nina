import React, { useState, useContext } from 'react'
import { styled } from '@mui/material/styles'
import * as Yup from 'yup'
import { useSnackbar } from 'notistack'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import { Typography } from '@mui/material'
import RedeemableStepper from './RedeemableStepper'
import { ReleaseContext } from '../contexts'

const RedeemableModal = (props) => {
  const { releasePubkey, amountHeld } = props

  const { enqueueSnackbar } = useSnackbar()
  const { redeemableRedeem, redeemableState } = useContext(ReleaseContext)
  const [open, setOpen] = useState(false)
  const [redeemerShippingValues, setRedeemerShippingValues] = useState({})
  const [formIsValid, setFormIsValid] = useState(false)
  const redeemable = redeemableState[releasePubkey]

  const handleRedeemableFormChange = (values, _errors) => {
    setRedeemerShippingValues({
      ...redeemerShippingValues,
      ...values,
    })
  }

  const submitRedeemableForm = async () => {
    const result = await redeemableRedeem(
      releasePubkey,
      redeemable,
      redeemerShippingValues
    )
    if (result) {
      enqueueSnackbar(result.msg, {
        variant: result.success ? 'success' : 'warn',
      })
    }
    setOpen(false)
    setRedeemerShippingValues({})
  }

  return (
    <Root>
      <Button
        variant="outlined"
        color="primary"
        className={classes.redeemCta}
        type="button"
        disabled={amountHeld < 1}
        onClick={() => setOpen(true)}
      >
        Redeem
      </Button>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={classes.paper}>
            {amountHeld < 1 && (
              <Typography
                variant="h6"
                gutterBottom
                className={classes.noCoinWarning}
              >
                ***Purchase Big Fuzzy Coin to enable redemption
              </Typography>
            )}
            <RedeemableStepper
              {...props}
              redeemerShippingValues={redeemerShippingValues}
              onChange={handleRedeemableFormChange}
              submitRedeemableForm={submitRedeemableForm}
              validationSchema={validationSchema}
              formIsValid={formIsValid}
              setFormIsValid={setFormIsValid}
            />
          </div>
        </Fade>
      </Modal>
    </Root>
  )
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name Required'),
  addressLine1: Yup.string().required('Address Required'),
  city: Yup.string().required('City Required'),
  state: Yup.string().required('State Required'),
  country: Yup.string().required('Country Required'),
  postalCode: Yup.string().required('Postal Code Required'),
})

const PREFIX = 'RedeemableModal'

const classes = {
  modal: `${PREFIX}-modal`,
  paper: `${PREFIX}-paper`,
  redeemCta: `${PREFIX}-redeemCta`,
  noCoinWarning: `${PREFIX}-noCoinWarning`,
}

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.modal}`]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'blue',
  },

  [`& .${classes.paper}`]: {
    boxShadow: theme.shadows[5],
    // width: '75%',
    maxHeight: '80vh',
    overflowY: 'auto',
    position: 'relative',
    borderRadius: '0px',
    ...theme.gradient,
  },

  [`& .${classes.redeemCta}`]: {
    fontSize: '14px',
    marginTop: theme.spacing(1),
    padding: `${theme.spacing(1, 0)}`,
    width: '100%',
    color: `${theme.palette.blue}`,
  },

  [`& .${classes.noCoinWarning}`]: {
    color: `${theme.palette.red}`,
    position: 'absolute',
    fontStyle: 'italic',
    right: '5rem',
    bottom: '1rem',
  },
}))

export default RedeemableModal
