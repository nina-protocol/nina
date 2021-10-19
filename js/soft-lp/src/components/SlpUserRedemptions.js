import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles';

import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import ninaCommon from 'nina-common'

const PREFIX = 'SlpUserRedemptions';

const classes = {
  modal: `${PREFIX}-modal`,
  paper: `${PREFIX}-paper`,
  myRedemptionsCta: `${PREFIX}-myRedemptionsCta`
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

  [`& .${classes.myRedemptionsCta}`]: {
    color: `${theme.palette.blue}`,
    borderColor: `${theme.palette.blue}`,
    '&:hover': {
      color: `${theme.palette.white}`,
      backgroundColor: `${theme.palette.blue}`,
    },
  }
}));

const { ReleaseContext } = ninaCommon.contexts
const { RedeemableUpdateShippingForm, UserRedemptionsList } =
  ninaCommon.components

const SlpUserRedemptions = (props) => {

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
    <StyledBox mt={3}>
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
    </StyledBox>
  );
}

export default SlpUserRedemptions
