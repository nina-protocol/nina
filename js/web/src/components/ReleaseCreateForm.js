import React, { useEffect } from 'react'
import ninaCommon from 'nina-common'
import { withFormik, Form, Field } from 'formik'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { TextField } from '@material-ui/core'
import Slider from '@material-ui/core/Slider'
import Box from '@material-ui/core/Box'
import CurrencyTextField from '@unicef/material-ui-currency-textfield'

const { NinaClient } = ninaCommon.utils

function ReleaseCreateForm({
  field,
  form,
  values,
  onChange,
  errors,
  touched,
  setFieldValue,
}) {
  const classes = useStyles()

  useEffect(() => {
    if (onChange) {
      onChange(values)
    }
  }, [values])

  const valuetext = (value) => {
    return `${value}%`
  }

  return (
    <div>
      <Form>
        <Field name="artist">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="outlined"
                label={NinaClient.formatPlaceholder(props.field.name)}
                size="small"
                {...props.field}
              />
              {errors.artist && touched.artist ? (
                <Typography className={classes.formError}>
                  {errors.artist}
                </Typography>
              ) : null}
            </Box>
          )}
        </Field>

        <Field name="title">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="outlined"
                label={NinaClient.formatPlaceholder(props.field.name)}
                size="small"
                {...props.field}
              />
              {errors.title && touched.title ? (
                <Typography className={classes.formError}>
                  {errors.title}
                </Typography>
              ) : null}
            </Box>
          )}
        </Field>

        <Field name="description">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="outlined"
                label={NinaClient.formatPlaceholder(props.field.name)}
                size="small"
                {...props.field}
              />
              {errors.description && touched.description ? (
                <div className={classes.formError}>{errors.description}</div>
              ) : null}
            </Box>
          )}
        </Field>

        <Field name="catalogNumber">
          {({ field }) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={`${classes.formField}`}
                variant="outlined"
                label={NinaClient.formatPlaceholder(field.name)}
                size="small"
                InputProps={{
                  onChange: (event) => {
                    let sanitized = event.target.value
                      .replace(/\s/g, '')
                      .toUpperCase()
                    setFieldValue('catalogNumber', sanitized)
                  },
                }}
                {...field}
              />
              {errors.catalogNumber && touched.catalogNumber ? (
                <div className={classes.formError}>{errors.catalogNumber}</div>
              ) : null}
            </Box>
          )}
        </Field>

        <Field name="amount">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <CurrencyTextField
                className={classes.formField}
                label={NinaClient.formatPlaceholder('Amount')}
                variant="outlined"
                value={props.value}
                currencySymbol=""
                outputFormat="string"
                size="small"
                minimumValue="0"
                decimalPlaces="0"
                onChange={(event, value) => setFieldValue('amount', value)}
              />
              {errors.amount && touched.amount ? (
                <div className={classes.formError}>{errors.amount}</div>
              ) : null}
            </Box>
          )}
        </Field>

        <Field name="retailPrice">
          {({ value }) => (
            <Box className={classes.fieldInputWrapper}>
              <CurrencyTextField
                className={classes.formField}
                label={NinaClient.formatPlaceholder('RetailPrice')}
                variant="outlined"
                value={value}
                currencySymbol="$"
                outputFormat="string"
                size="small"
                minimumValue="0"
                decimalPlaces="2"
                onChange={(event, value) => setFieldValue('retailPrice', value)}
              />
              {errors.retailPrice && touched.retailPrice ? (
                <div className={classes.formError}>{errors.retailPrice}</div>
              ) : null}
            </Box>
          )}
        </Field>

        <Box className={`${classes.formField}`} width="100%">
          <Typography
            id="discrete-slider-custom"
            align="left"
            style={{ color: 'rgba(0, 0, 0, 0.54)' }}
          >
            Resale Percentage:
          </Typography>
          <Box className={classes.resalePercentageWrapper}>
            <Slider
              defaultValue={20}
              getAriaValueText={valuetext}
              aria-labelledby="percent"
              className={`${classes.formField} ${classes.formSlider}`}
              step={1}
              min={0}
              max={100}
              name="resalePercentage"
              onChange={(event, value) => {
                setFieldValue('resalePercentage', value)
              }}
              {...field}
              {...form}
            />
            <Typography
              id="discrete-slider-custom"
              align="left"
              style={{ color: 'rgba(0, 0, 0, 0.54)' }}
            >
              {values.resalePercentage}%
            </Typography>
          </Box>
        </Box>
      </Form>
    </div>
  )
}

const useStyles = makeStyles((theme) => ({
  createFormContainer: {
    gridColumn: '2/6',
    width: '100%',
  },
  createReleaseContainer: {
    gridColumn: '7/11',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  createCta: {
    gridColumn: '1/13',
    paddingTop: '1rem',
  },
  fieldInputWrapper: {
    position: 'relative',
  },
  formField: {
    margin: '0.5rem 1rem 0.5rem 0',
    width: '100%',
    textTransform: 'capitalize',
    fontSize: '10px',
    position: 'relative',
    '& :placeholder': {
      textTransform: 'capitalize',
      lineHeight: 'normal',
      border: '2px solid red',
    },
    '& input': {
      textAlign: 'left',
      height: '1rem',
    },
  },
  formError: {
    position: 'absolute',
    top: '50%',
    right: theme.spacing(1),
    transform: 'translateY(-50%)',
    color: theme.vars.red,
    opacity: '.75',
  },
  resalePercentageWrapper: {
    display: 'flex',
    justifyContent: 'space-inbetween',
    alignItems: 'center',
  },
  formSlider: {
    '& MuiSlider-markLabel': {
      border: '2px solid red',
      marginLeft: '0',
    },
  },
}))

export default withFormik({
  enableReinitialize: true,
  validationSchema: (props) => {
    return props.ReleaseCreateSchema
  },
  mapPropsToValues: () => {
    return {
      artist: '',
      title: '',
      description: '',
      catalogNumber: '',
      amount: undefined,
      retailPrice: undefined,
      resalePercentage: 20,
    }
  },
})(ReleaseCreateForm)
