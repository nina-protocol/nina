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
        <Field name="catalogNumber">
          {({ field }) => (
            <>
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
            </>
          )}
        </Field>
        {errors.catalogNumber && touched.catalogNumber ? (
          <div className={classes.formError}>{errors.catalogNumber}</div>
        ) : null}
        <Field name="amount">
          {({ value }) => (
            <>
              <CurrencyTextField
                className={classes.formField}
                label={NinaClient.formatPlaceholder('Amount')}
                variant="outlined"
                value={value}
                currencySymbol=""
                outputFormat="string"
                size="small"
                minimumValue="0"
                decimalPlaces="0"
                onChange={(event, value) => setFieldValue('amount', value)}
              />
            </>
          )}
        </Field>
        {errors.amount && touched.amount ? (
          <div className={classes.formError}>{errors.amount}</div>
        ) : null}
        <Field name="retailPrice">
          {({ value }) => (
            <>
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
            </>
          )}
        </Field>
        {errors.retailPrice && touched.retailPrice ? (
          <div className={classes.formError}>{errors.retailPrice}</div>
        ) : null}
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
              // marks={marks}
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

const useStyles = makeStyles(() => ({
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
  formField: {
    margin: '0.5rem 1rem 0.5rem 0',
    width: '100%',
    textTransform: 'capitalize',
    fontSize: '10px',
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
  mapPropsToValues: () => {
    return {
      catalogNumber: '',
      amount: '',
      retailPrice: '0.00',
      resalePercentage: 20,
    }
  },
})(ReleaseCreateForm)
