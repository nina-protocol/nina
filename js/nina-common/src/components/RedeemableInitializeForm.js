import React, { useEffect } from 'react'
import { styled } from '@mui/material/styles';
import { withFormik, Form, Field } from 'formik'

import Typography from '@mui/material/Typography'
import { Button, TextField } from '@mui/material'
import NinaClient from '../utils/client'

export const RedeemableInitializeForm = (props) => {

  const { values, touched, errors, onChange } = props

  useEffect(() => {
    if (onChange) {
      onChange(values)
    }
  }, [values])

  return (
    <Root>
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
    </Root>
  );
}

const PREFIX = 'RedeemableInitializeForm';

const classes = {
  redeemableForm: `${PREFIX}-redeemableForm`,
  formField: `${PREFIX}-formField`,
  formError: `${PREFIX}-formError`
};

const Root = styled('div')((
  {
    theme
  }
) => ({
  [`& .${classes.redeemableForm}`]: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 1rem',
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
