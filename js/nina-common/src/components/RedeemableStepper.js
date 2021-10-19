import React from 'react'
import { styled } from '@mui/material/styles';

import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'   
import StepLabel from '@mui/material/StepLabel'
import StepContent from '@mui/material/StepContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import RedeemableClaimForm from './RedeemableClaimForm'

const PREFIX = 'RedeemableStepper';

const classes = {
  root: `${PREFIX}-root`,
  confirmHeader: `${PREFIX}-confirmHeader`,
  shippingInfo: `${PREFIX}-shippingInfo`
};

const Root = styled('div')(() => ({
  [`& .${classes.root}`]: {
    width: '300px',
    margin: 'auto',
    textAlign: 'center',
  },

  [`& .${classes.confirmHeader}`]: {
    textTransform: 'uppercase',
    fontWeight: '700',
    fontSize: '12px',
    paddingBottom: '20px',
  },

  [`& .${classes.shippingInfo}`]: {
    textAlign: 'left',
    '& p': {
      fontSize: '26px',
      lineHeight: '29.9px',
    },
  }
}));

const ConfirmShipping = (props) => {
  const { redeemerShippingValues } = props
  const classes = listStyles()

  return (
    <Box className={classes.root}>
      <Typography className={classes.confirmHeader}>
        Confirm Shipping Info
      </Typography>
      <Box className={classes.shippingInfo}>
        <Typography>{redeemerShippingValues.name}</Typography>
        <Typography>
          {redeemerShippingValues.addressLine1}
          {redeemerShippingValues.addressLine2
            ? `, ${redeemerShippingValues.addressLine2}`
            : ''}
        </Typography>
        <Typography>
          {redeemerShippingValues.city}, {redeemerShippingValues.state},{' '}
          {redeemerShippingValues.postalCode}
        </Typography>
        <Typography>{redeemerShippingValues.country}</Typography>
      </Box>
    </Box>
  )
}

const listStyles = makeStyles(() => ({
  [`& .${classes.root}`]: {
    width: '300px',
    margin: 'auto',
    textAlign: 'center',
  },

  [`& .${classes.confirmHeader}`]: {
    textTransform: 'uppercase',
    fontWeight: '700',
    fontSize: '12px',
    paddingBottom: '20px',
  },

  [`& .${classes.shippingInfo}`]: {
    textAlign: 'left',
    '& p': {
      fontSize: '26px',
      lineHeight: '29.9px',
    },
  }
}))

function getSteps() {
  return ['Enter Shipping Info', 'Confirm Shipping Info']
}

function getStepContent(step, props) {
  switch (step) {
    case 0:
      return <RedeemableClaimForm {...props} />
    case 1:
      return <ConfirmShipping {...props} />
    default:
      return 'Unknown step'
  }
}

export default function RedeemableStepper(props) {

  const { submitRedeemableForm, formIsValid } = props
  const [activeStep, setActiveStep] = React.useState(0)
  const steps = getSteps()

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  return (
    <Root
      className={`${classes.root} ${
        activeStep === 1 ? `${classes.small}` : ''
      } `}
    >
      <Stepper
        activeStep={activeStep}
        className={`${classes.stepper} ${
          activeStep === 1 ? `${classes.stepper}--small` : ''
        } `}
        orientation="vertical"
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              <div>{getStepContent(index, props)}</div>

              <div
                className={`${classes.actionsContainer} ${
                  activeStep === 1 ? `${classes.actionsContainer}--small` : ''
                }`}
              >
                {activeStep === 0 && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleNext}
                    disabled={!formIsValid}
                    className={`${classes.button}  ${
                      !formIsValid ? `${classes.button}--disabled` : ''
                    }`}
                  >
                    Confirm Shipping
                  </Button>
                )}
                {activeStep === 1 && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={submitRedeemableForm}
                    disabled={!formIsValid}
                    className={classes.redeemButton}
                  >
                    Redeem
                  </Button>
                )}
                {activeStep > 0 && (
                  <Typography
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className={classes.backButton}
                  >
                    Edit Shipping Info
                  </Typography>
                )}
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Root>
  );
}
