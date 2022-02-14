import React, { useEffect } from 'react'
import { styled } from '@mui/material/styles'
import nina from "@nina-protocol/nina-sdk";
import { withFormik, Form, Field } from 'formik'
import { TextField } from '@mui/material'
import Box from '@mui/material/Box'

const { NinaClient } = nina.utils

const HubCreateForm = ({ values, onChange, errors, touched }) => {
  useEffect(() => {
    if (onChange) {
      onChange(values)
    }
  }, [values])

  return (
    <Root>
      <Form>
        <Field name="name">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="standard"
                label={NinaClient.formatPlaceholder(props.field.name)}
                size="small"
                InputLabelProps={touched.artist ? { shrink: true } : ''}
                placeholder={
                  errors.artist && touched.artist ? errors.artist : null
                }
                {...props.field}
              />
            </Box>
          )}
        </Field>

        <Field name="publishFee">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="standard"
                label={NinaClient.formatPlaceholder(props.field.name)}
                size="small"
                InputLabelProps={touched.title ? { shrink: true } : ''}
                placeholder={
                  errors.title && touched.title ? errors.title : null
                }
                {...props.field}
              />
            </Box>
          )}
        </Field>
        <Field name="referralFee">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="standard"
                label={NinaClient.formatPlaceholder(props.field.name)}
                size="small"
                InputLabelProps={touched.title ? { shrink: true } : ''}
                placeholder={
                  errors.title && touched.title ? errors.title : null
                }
                {...props.field}
              />
            </Box>
          )}
        </Field>
        <Field name="uri">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="standard"
                label={NinaClient.formatPlaceholder(props.field.name)}
                size="small"
                InputLabelProps={touched.artist ? { shrink: true } : ''}
                placeholder={
                  errors.artist && touched.artist ? errors.artist : null
                }
                {...props.field}
              />
            </Box>
          )}
        </Field>
      </Form>
    </Root>
  )
}
const PREFIX = 'HubCreateForm'

const classes = {
  fieldInputWrapper: `${PREFIX}-fieldInputWrapper`,
  formField: `${PREFIX}-formField`,
}

const Root = styled('div')(({ theme }) => ({
  margin: 'auto',
  width: '300px',
  [`& .${classes.fieldInputWrapper}`]: {
    position: 'relative',
  },
  [`& .${classes.formField}`]: {
    ...theme.helpers.baseFont,
    marginBottom: '8px',
    width: '100%',
    textTransform: 'capitalize',
    position: 'relative',
    '& input': {
      textAlign: 'left',
      '&::placeholder': {
        color: theme.palette.red,
      },
    },
  },
}))

export default withFormik({
  enableReinitialize: true,
  // validationSchema: (props) => {
  //   return props.ReleaseCreateSchema;
  // },
  mapPropsToValues: () => {
    return {
      name: 'my first hub',
      publishFee: 2,
      referralFee: 2,
      uri: 'www.hub.com',
    }
  },
})(HubCreateForm)
