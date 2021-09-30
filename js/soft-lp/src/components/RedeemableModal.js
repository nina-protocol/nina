import React, { useState, useContext } from 'react'
import * as Yup from 'yup'
import { useSnackbar } from 'notistack'
import { makeStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import Button from '@material-ui/core/Button'
import { Typography } from '@material-ui/core'
import RedeemableStepper from './RedeemableStepper'
import ninaCommon from 'nina-common'

const { ReleaseContext } = ninaCommon.contexts

const RedeemableModal = (props) => {
  const { releasePubkey, amountHeld } = props
  const classes = useStyles()
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
    <div>
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
    </div>
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

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    boxShadow: theme.shadows[5],
    // width: '75%',
    maxHeight: '80vh',
    overflowY: 'auto',
    position: 'relative',
    borderRadius: '0px',
    ...theme.helpers.gradient,
  },
  redeemCta: {
    fontSize: '14px',
    marginTop: `${theme.spacing(1)}px`,
    padding: `${theme.spacing(1, 0)}`,
    width: '100%',
    color: `${theme.vars.blue}`,
  },
  noCoinWarning: {
    color: `${theme.vars.red}`,
    position: 'absolute',
    fontStyle: 'italic',
    right: '5rem',
    bottom: '1rem',
  },
}))

export default RedeemableModal
