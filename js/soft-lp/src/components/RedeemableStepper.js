import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import RedeemableClaimForm from './RedeemableClaimForm'

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
  root: {
    width: '300px',
    margin: 'auto',
    textAlign: 'center',
  },
  confirmHeader: {
    textTransform: 'uppercase',
    fontWeight: '700',
    fontSize: '12px',
    paddingBottom: '20px',
  },
  shippingInfo: {
    textAlign: 'left',
    '& p': {
      fontSize: '26px',
      lineHeight: '29.9px',
    },
  },
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
  const classes = useStyles()
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
    <div
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
    </div>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: '0px',

    '& .MuiStepLabel-vertical': {
      display: 'none',
    },
    '& .MuiStepConnector-vertical': {
      display: 'none',
    },
    '& .MuiStepConnector-line': {
      display: 'none',
      border: 'none',
    },
    '& .MuiStepContent-root': {
      border: 'none',
      marginLeft: '0',
      paddingLeft: '0',
    },
  },
  small: {
    width: '400px',
    height: '361px',
  },
  stepper: {
    ...theme.helpers.gradient,
    padding: '60px',
    '&--small': {
      padding: `${theme.spacing(2, 6)}`,
    },
  },
  actionsContainer: {
    padding: `${theme.spacing(2, 1)}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 'auto',
    '&--small': {
      maxWidth: '300px',
    },
  },
  button: {
    width: '221px',
    color: `${theme.vars.blue}`,
    backgroundColor: `${theme.vars.white}`,
    fontSize: '14px',
    margin: `${theme.spacing(2, 0, 0)}`,
    '&--disabled': {
      color: `${theme.vars.white} !important`,
      borderRadius: '0px !important',
      backgroundColor: `${theme.vars.transparent}`,
      width: '100%',
      border: `2px dashed ${theme.vars.white} !important`,
    },
    '&:hover': {
      color: `${theme.vars.white}`,
      backgroundColor: `${theme.vars.blue}`,
    },
  },
  redeemButton: {
    margin: 'auto',
    color: `${theme.vars.blue} !important`,
    fontSize: '14px',
    fontWeight: '700',
    width: '100%',
    '&:hover': {
      color: `${theme.vars.white}`,
      backgroundColor: `${theme.vars.blue}`,
    },
  },
  backButton: {
    color: `${theme.vars.white}`,
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: `${theme.spacing(2, 0)}`,
  },
}))
