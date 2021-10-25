import React, { useEffect } from 'react'
import { styled } from '@mui/material/styles';
import { withFormik, Form, Field } from 'formik'

import Typography from '@mui/material/Typography'
import { Button, TextField } from '@mui/material'
import Box from '@mui/material/Box'
import NinaClient from '../utils/client'

export const RedeemableUpdateShippingForm = (props) => {
  const { values, touched, errors, onChange, selectedRecord } = props


  useEffect(() => {
    if (onChange) {
      onChange(values)
    }
  }, [values])

  const formatAddress = (address) => {
    const splitAddress = address.split(',')
    const formatted = (
      <StyledBox className={classes.address}>
        <Typography variant="body2">{splitAddress[0]}</Typography>
        <Typography>
          {splitAddress[1]}, {splitAddress[2]}
        </Typography>
        <Typography>
          {splitAddress[3]}, {splitAddress[4]}, {splitAddress[5]}
        </Typography>
        <Typography>{splitAddress[6]}</Typography>
      </StyledBox>
    )
    return formatted
  }

  if (!selectedRecord) {
    return <></>
  }
  return (
    <Box className={classes.root}>
      <Box>
        <Typography variant="h6" gutterBottom className={classes.header}>
          {selectedRecord.userIsPublisher
            ? 'Update Tracking Info for:'
            : 'Shipping + Tracking:'}
        </Typography>
        <Box className={classes.shippingInfo}>
          <Typography variant="body2" gutterBottom>
            {formatAddress(selectedRecord?.address)}
          </Typography>

          <Box className={classes.redemptionInfo}>
            <Typography variant="body2" gutterBottom>
              <strong>Redeemable:</strong>{' '}
              {selectedRecord?.redeemable.toBase58()}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Redemption Record:</strong>{' '}
              {selectedRecord?.publicKey.toBase58()}
            </Typography>
          </Box>

          {selectedRecord?.shipper && (
            <>
              <Typography variant="body2" gutterBottom>
                <strong>Shipping Info</strong>
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Shipper:</strong> {selectedRecord?.shipper}
              </Typography>
            </>
          )}
          {selectedRecord.trackingNumber && (
            <Typography variant="body2" gutterBottom>
              <strong>Tracking Number:</strong> {selectedRecord?.trackingNumber}
            </Typography>
          )}

          {!selectedRecord.shipper && (
            <Typography variant="body2" gutterBottom>
              <strong>awaiting tracking information </strong>
            </Typography>
          )}
        </Box>
      </Box>
      <>
        {!selectedRecord.shipper && selectedRecord.userIsPublisher && (
          <Form className={`${classes.redeemableForm}`}>
            <Field name="shipper">
              {(props) => (
                <>
                  <TextField
                    className={classes.formField}
                    variant="outlined"
                    placeholder={NinaClient.formatPlaceholder(props.field.name)}
                    label={NinaClient.formatPlaceholder(props.field.name)}
                    {...props.field}
                  />
                </>
              )}
            </Field>
            {errors.shipper && touched.shipper ? (
              <div className={classes.formError}>{errors.shipper}</div>
            ) : null}

            <Field name="trackingNumber">
              {(props) => (
                <>
                  <TextField
                    className={classes.formField}
                    variant="outlined"
                    placeholder={NinaClient.formatPlaceholder(props.field.name)}
                    label={NinaClient.formatPlaceholder(props.field.name)}
                    {...props.field}
                  />
                </>
              )}
            </Field>
            {errors.trackingNumber && touched.trackingNumber ? (
              <div className={classes.formError}>{errors.trackingNumber}</div>
            ) : null}

            <Button type="submit" color="primary" variant="contained">
              Update
            </Button>
          </Form>
        )}
      </>
    </Box>
  )
}

const PREFIX = 'RedeemableUpdateShippingForm';

const classes = {
  root: `${PREFIX}-root`,
  header: `${PREFIX}-header`,
  shippingInfo: `${PREFIX}-shippingInfo`,
  redemptionInfo: `${PREFIX}-redemptionInfo`,
  redeemableForm: `${PREFIX}-redeemableForm`,
  formField: `${PREFIX}-formField`,
  formError: `${PREFIX}-formError`
};

const StyledBox = styled(Box)((
  {
    theme
  }
) => ({
  [`& .${classes.root}`]: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: `${theme.palette.transparent}`,
  },

  [`& .${classes.header}`]: {
    textTransform: 'uppercase',
    fontWeight: '700',
    fontSize: '14px',
  },

  [`& .${classes.shippingInfo}`]: {
    textAlign: 'left',
    '& p': {
      fontSize: '26px',
    },
  },

  [`& .${classes.redemptionInfo}`]: {
    '& p': {
      fontSize: '14px',
    },
  },

  [`& .${classes.redeemableForm}`]: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflowY: 'auto',
  },

  [`& .${classes.formField}`]: {
    margin: '0.75rem 1rem',
    width: '100%',
    textTransform: 'capitalize',
    '& :placeholder': {
      textTransform: 'capitalize',
    },
  },

  [`& .${classes.formError}`]: {
    color: `${theme.palette.red}`,
  }
}));


export default withFormik({
  enableReinitialize: true,
  mapPropsToValues: (props) => {
    return {
      shipper: props.redeemableTrackingValues.shipper,
      trackingNumber: props.redeemableTrackingValues.trackingNumber,
    }
  },
  handleSubmit: (values, formikBag) => {
    formikBag.props.submitRedeemableUpdateForm()
  },
})(RedeemableUpdateShippingForm)
