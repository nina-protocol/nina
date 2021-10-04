import React, { useEffect } from 'react'
import { withFormik, Form, Field } from 'formik'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { Button, TextField } from '@material-ui/core'
import NinaClient from '../utils/client'

export const RedeemableInitializeForm = (props) => {
  const classes = useStyles()
  const { values, touched, errors, onChange } = props

  useEffect(() => {
    if (onChange) {
      onChange(values)
    }
  }, [values])

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Create Redeemable
      </Typography>
      <>
        <Form className={`${classes.redeemableForm}`}>
          <Field name="releasePubkey">
            {(props) => (
              <>
                <TextField
                  className={classes.formField}
                  variant="outlined"
                  placeholder={NinaClient.formatPlaceholder(props.field.name)}
                  label={NinaClient.formatPlaceholder(props.field.name)}
                  disabled={true}
                  {...props.field}
                />
              </>
            )}
          </Field>
          {errors.name && touched.name ? (
            <div className={classes.formError}>{errors.name}</div>
          ) : null}

          <Field name="description">
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
          {errors.description && touched.description ? (
            <div className={classes.formError}>{errors.description}</div>
          ) : null}

          <Field name="amount">
            {(props) => (
              <>
                <TextField
                  className={classes.formField}
                  variant="outlined"
                  type="number"
                  placeholder={NinaClient.formatPlaceholder(props.field.name)}
                  label={NinaClient.formatPlaceholder(props.field.name)}
                  {...props.field}
                />
              </>
            )}
          </Field>
          {errors.description && touched.description ? (
            <div className={classes.formError}>{errors.description}</div>
          ) : null}

          <Button type="submit" color="primary" variant="contained">
            Submit
          </Button>
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
    padding: '0 1rem',
    overflowY: 'auto',
  },
  formField: {
    margin: '0.75rem 1rem',
    width: '100%',
    textTransform: 'capitalize',
    '& :placeholder': {
      textTransform: 'capitalize',
    },
  },
  formError: {
    color: `${theme.vars.red}`,
  },
}))

export default withFormik({
  mapPropsToValues: (props) => {
    return {
      releasePubkey: props.releasePubkey,
      description: '',
      amount: props.amount,
    }
  },
  handleSubmit: (values, formikBag) => {
    formikBag.props.submitRedeemableInitForm()
  },
})(RedeemableInitializeForm)
