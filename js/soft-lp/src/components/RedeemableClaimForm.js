import React, { useState, useEffect } from 'react'
import { withFormik, Form, Field } from 'formik'
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector'
import { makeStyles } from '@material-ui/core/styles'
import { TextField } from '@material-ui/core'
import ninaCommon from 'nina-common'

const NinaClient = ninaCommon.utils.NinaClient

export const RedeemableClaimForm = (props) => {
  const {
    values,
    errors,
    handleChange,
    onChange,
    handleBlur,
    validationSchema,
    setFormIsValid,
    amountHeld,
  } = props
  const classes = useStyles()
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    if (onChange) {
      onChange(values)
      validationSchema.isValid(values).then((valid) => {
        setFormIsValid(valid)
      })
    }
  }, [values])

  useEffect(() => {
    if (amountHeld > 0) {
      setDisabled(false)
    }
  }, [amountHeld])

  return (
    <div>
      <>
        <Form className={`${classes.redeemableForm}`}>
          <Field name="name" shrink={false}>
            {(props) => (
              <>
                <TextField
                  className={classes.formField}
                  variant="outlined"
                  placeholder={NinaClient.formatPlaceholder(props.field.name)}
                  error={errors.name}
                  disabled={disabled}
                  InputLabelProps={{ shrink: false }}
                  shrink={false}
                  {...props.field}
                />
              </>
            )}
          </Field>

          <Field name="addressLine1">
            {(props) => (
              <>
                <TextField
                  className={classes.formField}
                  variant="outlined"
                  placeholder={NinaClient.formatPlaceholder(props.field.name)}
                  error={errors.addressLine1}
                  disabled={disabled}
                  {...props.field}
                />
              </>
            )}
          </Field>

          <Field name="addressLine2">
            {(props) => (
              <>
                <TextField
                  className={classes.formField}
                  variant="outlined"
                  placeholder={NinaClient.formatPlaceholder(props.field.name)}
                  disabled={disabled}
                  {...props.field}
                />
              </>
            )}
          </Field>

          <Field name="city">
            {(props) => (
              <>
                <TextField
                  className={classes.formField}
                  variant="outlined"
                  placeholder={NinaClient.formatPlaceholder(props.field.name)}
                  error={errors.city}
                  disabled={disabled}
                  {...props.field}
                />
              </>
            )}
          </Field>

          <div className={classes.formInputGroup}>
            <Field name="country">
              {() => (
                <>
                  <CountryDropdown
                    name="country"
                    value={values.country}
                    onChange={(_, e) => handleChange(e)}
                    onBlur={handleBlur}
                    className={`${classes.formField} ${classes.formSelect} `}
                    disabled={disabled}
                  />
                </>
              )}
            </Field>

            <Field name="state">
              {() => (
                <>
                  <RegionDropdown
                    name="state"
                    country={values.country}
                    value={values.state}
                    onChange={(_, e) => handleChange(e)}
                    onBlur={handleBlur}
                    className={`${classes.formField} ${classes.formSelect}`}
                    defaultOptionLabel={
                      values.country === 'United States'
                        ? 'Select State'
                        : 'Select Region'
                    }
                    disabled={disabled}
                  />
                </>
              )}
            </Field>

            <Field name="postalCode">
              {(props) => (
                <>
                  <TextField
                    className={classes.formField}
                    variant="outlined"
                    placeholder={NinaClient.formatPlaceholder(props.field.name)}
                    error={errors.postalCode}
                    disabled={disabled}
                    {...props.field}
                  />
                </>
              )}
            </Field>
          </div>
        </Form>
      </>
    </div>
  )
}

const useStyles = makeStyles((theme) => ({
  redeemableForm: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${theme.spacing(0, 1)}`,
    overflowY: 'auto',
    width: '545px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '0px',
    },
  },
  formField: {
    margin: `${theme.spacing(0, 1, 1)}`,
    width: '100%',
    backgroundColor: `${theme.vars.white}`,
    textTransform: 'capitalize',
    '& input': {
      '&::placeholder': {
        textTransform: 'uppercase',
        fontSize: `10px`,
        color: `${theme.vars.grey}`,
        opacity: '1',
      },
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
    formField: {
      border: '2px solid red',
    },
    '& select': {
      '& option': {
        textTransform: 'uppercase',
        color: 'red',
      },
    },
    '& > :first-child': {
      marginLeft: '0',
      marginRight: '10px',
    },
    '& > :nth-child(2)': {
      marginLeft: '0',
      marginRight: '0',
    },
    '& > :last-child': {
      marginRight: '0',
      marginLeft: '10px',
    },
  },
}))

export default withFormik({
  mapPropsToValues: (props) => {
    const filledValues = props.redeemerShippingValues
    return {
      name: filledValues?.name || '',
      addressLine1: filledValues?.addressLine1 || '',
      addressLine2: filledValues?.addressLine2 || '',
      city: filledValues?.city || '',
      state: filledValues?.state || '',
      postalCode: filledValues?.postalCode || '',
      country: filledValues?.country || 'United States',
    }
  },
  handleSubmit: (values, formikBag) => {
    formikBag.props.submitRedeemableForm()
  },
  validationSchema: (props) => {
    return props.validationSchema
  },
  validateOnChange: false,
  validateOnBlur: false,
})(RedeemableClaimForm)
