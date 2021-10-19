import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles';

import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { ReleaseContext } from '../contexts'
import RedeemableUpdateShippingForm from './RedeemableUpdateShippingForm.js'
import RedeemableUpdateShippingList from './RedeemableUpdateShippingList.js'

const PREFIX = 'RedeemableUpdate';

const classes = {
  modal: `${PREFIX}-modal`,
  paper: `${PREFIX}-paper`
};

const StyledBox = styled(Box)((
  {
    theme
  }
) => ({
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
    width: '75%',
    maxHeight: '80vh',
    overflowY: 'auto',
    display: 'grid',
    gridTemplateColumns: '20% 80%',
    gridGap: '1rem',
  }
}));

const RedeemableUpdate = (props) => {

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
    <StyledBox>
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
    </StyledBox>
  );
}

export default RedeemableUpdate
