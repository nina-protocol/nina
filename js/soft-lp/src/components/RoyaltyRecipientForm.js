import React, { useContext } from 'react'
import { Formik, Field, Form } from 'formik'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { TextField, Typography, Box } from '@material-ui/core'
import Slider from '@material-ui/core/Slider'
import ninaCommon from 'nina-common'

const { ReleaseContext, NameContext } = ninaCommon.contexts
const NinaClient = ninaCommon.utils.NinaClient

const RoyaltyRecipientForm = (props) => {
  const { release, userShare, setUserDisplayShare, releasePubkey, toggleForm } =
    props
  const { addRoyaltyRecipient } = useContext(ReleaseContext)
  const { addRoyaltyRecipientByTwitterHandle } = useContext(NameContext)
  const classes = useStyles()

  const handleDisplayPercent = (value) => {
    const sending = parseInt(value)
    setUserDisplayShare(userShare - sending)
  }

  const valuetext = (value) => {
    return `${value}%`
  }

  const marks = [
    {
      value: 0,
      label: '0%',
    },
    {
      value: userShare,
      label: `${userShare}%`,
    },
  ]

  return (
    <div>
      <Formik
        initialValues={{
          recipientAddress: '',
          percentShare: 20,
        }}
        onSubmit={async (values, { resetForm, initialValues }) => {
          if (values.recipientAddress.length !== 44) {
            await addRoyaltyRecipientByTwitterHandle(
              release,
              values,
              releasePubkey
            )
          } else {
            await addRoyaltyRecipient(release, values, releasePubkey)
          }
          resetForm(initialValues)
          toggleForm()
        }}
      >
        {(props) => (
          <Box mt={3} className="royalty__form-wrapper">
            <Typography variant="h6">
              Transferring {props.values.percentShare}% to:
            </Typography>
            <Form className="royalty__form">
              <Field name="recipientAddress">
                {(props) => (
                  <>
                    <TextField
                      className={classes.formField}
                      variant="outlined"
                      placeholder={NinaClient.formatPlaceholder(
                        props.field.name
                      )}
                      label={NinaClient.formatPlaceholder(props.field.name)}
                      {...props.field}
                    />
                  </>
                )}
              </Field>

              <Typography
                id="discrete-slider-custom"
                align="left"
                style={{ color: 'rgba(0, 0, 0, 0.54)' }}
              >
                Percent Share:
              </Typography>
              <Box className={classes.royaltyPercentageWrapper}>
                <Slider
                  defaultValue={20}
                  getAriaValueText={valuetext}
                  aria-labelledby="percent"
                  // valueLabelDisplay="auto"
                  className={`${classes.formField} ${classes.formSlider}`}
                  step={1}
                  min={0}
                  max={userShare}
                  name="resalePercentage"
                  marks={marks}
                  onChange={(event, value) => {
                    handleDisplayPercent(value)
                    props.setFieldValue('percentShare', value)
                  }}
                  {...props.field}
                  {...props.form}
                />
              </Box>

              <Box mt={3}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Transfer Royalty
                </Button>
              </Box>
            </Form>
          </Box>
        )}
      </Formik>
    </div>
  )
}

const useStyles = makeStyles((theme) => ({
  redeemableForm: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 1rem',
    overflowY: 'auto',
  },
  formField: {
    margin: '0.75rem 0em',
    width: '100%',
    textTransform: 'capitalize',
    '& :placeholder': {
      textTransform: 'capitalize',
    },
  },
  formSelect: {
    padding: '18.5px 14px',
    boxSizing: 'border-box',
    borderColor: 'rgba(0, 0, 0, 0.23)',
    color: 'rgba(0, 0, 0, 0.5)',
    '& $option': {
      color: 'red',
    },
  },
  formInputGroup: {
    display: 'flex',
    width: '100%',
    '& > :first-child': {
      marginLeft: '0',
    },
    '& > :last-child': {
      marginRight: '0',
    },
  },
  royaltyPercentageWrapper: {
    display: 'flex',
    justifyContent: 'space-inbetween',
    alignItems: 'center',
  },
  formError: {
    color: `${theme.vars.red}`,
  },
}))

export default RoyaltyRecipientForm
