import React, { useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import { useSnackbar } from 'notistack'
import { Formik, Field, Form } from 'formik'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Slider from '@mui/material/Slider'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { formatPlaceholder } from '@nina-protocol/nina-internal-sdk/esm/utils'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
const RoyaltyRecipientForm = (props) => {
  const { getUsdcBalance } = useContext(Nina.Context)
  const { release, userShare, setUserDisplayShare, releasePubkey, toggleForm } =
    props
  const { enqueueSnackbar } = useSnackbar()
  const { addRoyaltyRecipient } = useContext(Release.Context)
  useEffect(() => {
    getUsdcBalance()
  }, [])
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
    <Root>
      <Formik
        initialValues={{
          recipientAddress: '',
          percentShare: 20,
        }}
        onSubmit={async (values, { resetForm, initialValues }) => {
          enqueueSnackbar('Transferring Royalty...', {
            variant: 'info',
          })
          const result = await addRoyaltyRecipient(
            release,
            values,
            releasePubkey
          )
          enqueueSnackbar(result.success ? result.msg : 'Transfer Cancelled', {
            variant: result.success ? 'success' : 'warn',
          })
          resetForm(initialValues)
          toggleForm()
        }}
      >
        {({ values, setFieldValue, field, form }) => (
          <Box mt={3} className="royalty__form-wrapper">
            <Typography variant="h6">
              Transferring {values.percentShare}% to:
            </Typography>
            <Form className="royalty__form">
              <Field name="recipientAddress">
                {({ field }) => (
                  <>
                    <TextField
                      className={classes.formField}
                      variant="outlined"
                      label={formatPlaceholder(field.name)}
                      {...field}
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
                  className={`${classes.formField} ${classes.formSlider}`}
                  step={1}
                  min={0}
                  max={userShare}
                  name="resalePercentage"
                  marks={marks}
                  onChange={(event, value) => {
                    handleDisplayPercent(value)
                    setFieldValue('percentShare', value)
                  }}
                  {...field}
                  {...form}
                />
              </Box>

              <Box mt={3}>
                <Button
                  type="submit"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  disabled={!values.recipientAddress}
                >
                  Transfer Revenue Share
                </Button>
              </Box>
            </Form>
          </Box>
        )}
      </Formik>
    </Root>
  )
}

const PREFIX = 'RoyaltyRecipientForm'

const classes = {
  redeemableForm: `${PREFIX}-redeemableForm`,
  formField: `${PREFIX}-formField`,
  formSelect: `${PREFIX}-formSelect`,
  formInputGroup: `${PREFIX}-formInputGroup`,
  royaltyPercentageWrapper: `${PREFIX}-royaltyPercentageWrapper`,
  formError: `${PREFIX}-formError`,
}

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.redeemableForm}`]: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 1rem',
    overflowY: 'auto',
  },

  [`& .${classes.formField}`]: {
    margin: '0.75rem 0em',
    width: '100%',
    textTransform: 'capitalize',
    '& :placeholder': {
      textTransform: 'capitalize',
    },
  },

  [`& .${classes.formSelect}`]: {
    padding: '18.5px 14px',
    boxSizing: 'border-box',
    borderColor: 'rgba(0, 0, 0, 0.23)',
    color: 'rgba(0, 0, 0, 0.5)',
    '& $option': {
      color: 'red',
    },
  },

  [`& .${classes.formInputGroup}`]: {
    display: 'flex',
    width: '100%',
    '& > :first-child': {
      marginLeft: '0',
    },
    '& > :last-child': {
      marginRight: '0',
    },
  },

  [`& .${classes.royaltyPercentageWrapper}`]: {
    display: 'flex',
    justifyContent: 'space-inbetween',
    alignItems: 'center',
  },

  [`& .${classes.formError}`]: {
    color: `${theme.palette.red}`,
  },
}))

export default RoyaltyRecipientForm
