import React, { useState, useEffect, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import ninaCommon from 'nina-common'
import RedeemableUpdateShippingForm from './RedeemableUpdateShippingForm.js'
import RedeemableUpdateShippingList from './RedeemableUpdateShippingList.js'

const { ReleaseContext } = ninaCommon.contexts

const RedeemableUpdate = (props) => {
  const classes = useStyles()
  const { releasePubkey, redeemables, redemptionRecords } = props
  const [open, setOpen] = React.useState(false)
  const [redeemableTrackingValues, setRedeemableTrackingValues] = useState({})
  const { redeemableUpdateShipping } = useContext(ReleaseContext)
  const [selectedRecord, setSelectedRecord] = useState(undefined)

  const handleSelectRecord = (event, index) => {
    setRedeemableTrackingValues({
      shipper: '',
      trackingNumber: '',
    })
    setSelectedRecord(redemptionRecords[index])
  }

  const handleFormChange = (values, _errors) => {
    setRedeemableTrackingValues({
      ...redeemableTrackingValues,
      ...values,
    })
  }

  useEffect(() => {
    if (selectedRecord && redemptionRecords) {
      const updatedRecord = redemptionRecords.find(
        (record) =>
          record.publicKey.toBase58() === selectedRecord.publicKey.toBase58()
      )
      setSelectedRecord(updatedRecord)
    }
  }, [redemptionRecords])

  const submitRedeemableUpdateForm = () => {
    redeemableUpdateShipping(
      redeemables.publicKey,
      selectedRecord.publicKey,
      redeemableTrackingValues
    )
  }

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        type="button"
        onClick={() => setOpen(true)}
        fullWidth
      >
        Update Redeemable Shipping ({redemptionRecords?.length})
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
            <RedeemableUpdateShippingList
              redemptionRecords={redemptionRecords}
              handleSelectRecord={handleSelectRecord}
              setSelectedRecord={setSelectedRecord}
              selectedRecord={selectedRecord}
            />
            <RedeemableUpdateShippingForm
              redeemableTrackingValues={redeemableTrackingValues}
              onChange={handleFormChange}
              submitRedeemableUpdateForm={submitRedeemableUpdateForm}
              releasePubkey={releasePubkey}
              selectedRecord={selectedRecord}
              redeemables={redeemables}
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
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    width: '75%',
    maxHeight: '80vh',
    overflowY: 'auto',
    display: 'grid',
    gridTemplateColumns: '20% 80%',
    gridGap: '1rem',
  },
}))

export default RedeemableUpdate
