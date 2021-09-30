import React, { useState, useEffect, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import ninaCommon from 'nina-common'
import RedeemableUpdateShippingForm from './RedeemableUpdateShippingForm.js'
import UserRedemptionsList from './UserRedemptionsList.js'

const { ReleaseContext } = ninaCommon.contexts

const SlpUserRedemptions = (props) => {
  const classes = useStyles()
  const { releasePubkey, redeemables, userRedemptionRecords } = props
  const { redeemableUpdateShipping } = useContext(ReleaseContext)
  const [selectedRecord, setSelectedRecord] = useState(undefined)
  const [open, setOpen] = useState(false)
  const [redeemableTrackingValues, setRedeemableTrackingValues] = useState({})

  const handleSelectRecord = (event, index) => {
    setRedeemableTrackingValues({
      shipper: '',
      trackingNumber: '',
    })
    setSelectedRecord(userRedemptionRecords[index])
  }

  const handleFormChange = (values, _errors) => {
    setRedeemableTrackingValues({
      ...redeemableTrackingValues,
      ...values,
    })
  }

  useEffect(() => {
    if (selectedRecord && userRedemptionRecords) {
      const updatedRecord = userRedemptionRecords.find(
        (record) =>
          record.publicKey.toBase58() === selectedRecord.publicKey.toBase58()
      )
      setSelectedRecord(updatedRecord)
    }
  }, [userRedemptionRecords])

  const submitRedeemableUpdateForm = () => {
    redeemableUpdateShipping(
      redeemables.publicKey,
      selectedRecord.publicKey,
      redeemableTrackingValues
    )
  }

  return (
    <Box mt={3}>
      <Button
        variant="outlined"
        color="primary"
        type="button"
        onClick={() => setOpen(true)}
        fullWidth
      >
        My Redemptions
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
            <UserRedemptionsList
              userRedemptionRecords={userRedemptionRecords}
              handleSelectRecord={handleSelectRecord}
              setSelectedRecord={setSelectedRecord}
              selectedRecord={selectedRecord}
            />
            <RedeemableUpdateShippingForm
              onChange={handleFormChange}
              submitRedeemableUpdateForm={submitRedeemableUpdateForm}
              releasePubkey={releasePubkey}
              selectedRecord={selectedRecord}
              redeemables={redeemables}
              redeemableTrackingValues={redeemableTrackingValues}
            />
          </div>
        </Fade>
      </Modal>
    </Box>
  )
}

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    width: '75%',
    maxHeight: '80vh',
    overflowY: 'auto',
    display: 'grid',
    gridTemplateColumns: '20% 80%',
    gridGap: '1rem',
    ...theme.helpers.gradient,
  },
  myRedemptionsCta: {
    color: `${theme.vars.blue}`,
    borderColor: `${theme.vars.blue}`,
    '&:hover': {
      color: `${theme.vars.white}`,
      backgroundColor: `${theme.vars.blue}`,
    },
  },
}))

export default SlpUserRedemptions
