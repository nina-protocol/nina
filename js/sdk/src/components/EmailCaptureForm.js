import React, { useEffect } from 'react'
import { styled } from '@mui/material/styles'
import { withFormik, Form, Field } from 'formik'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import { formatPlaceholder } from '../utils/index.js'

const EmailCaptureForm = ({
  values,
  onChange,
  errors,
  touched,
  twitterAccount,
  soundcloudAccount,
}) => {
  useEffect(() => {
    if (onChange) {
      onChange(values)
    }
  }, [values])

  return (
    <Root>
      <Form>
        <Field name="email">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="standard"
                label={formatPlaceholder(props.field.name)}
                size="small"
                InputLabelProps={touched.email ? { shrink: true } : ''}
                placeholder={
                  errors.email && touched.email ? errors.email : null
                }
                {...props.field}
              />
            </Box>
          )}
        </Field>

        <Field name="soundcloud">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="standard"
                label={formatPlaceholder(props.field.name)}
                size="small"
                InputLabelProps={
                  touched.soundcloud || soundcloudAccount
                    ? { shrink: true }
                    : ''
                }
                placeholder={
                  errors.soundcloud && touched.soundcloud
                    ? errors.soundcloud
                    : null
                }
                {...props.field}
              />
            </Box>
          )}
        </Field>
        <Field name="twitter">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="standard"
                label={formatPlaceholder(props.field.name)}
                size="small"
                InputLabelProps={
                  touched.twitter || twitterAccount ? { shrink: true } : ''
                }
                placeholder={
                  errors.twitter && touched.twitter ? errors.twitter : null
                }
                {...props.field}
              />
            </Box>
          )}
        </Field>
        <Field name="instagram">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="standard"
                label={formatPlaceholder(props.field.name)}
                size="small"
                InputLabelProps={touched.instagram ? { shrink: true } : ''}
                placeholder={
                  errors.instagram && touched.instagram
                    ? errors.instagram
                    : null
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
const PREFIX = 'EmailCaptureForm'

const classes = {
  fieldInputWrapper: `${PREFIX}-fieldInputWrapper`,
  formField: `${PREFIX}-formField`,
}

const Root = styled('div')(({ theme }) => ({
  margin: 'auto',
  [`& .${classes.fieldInputWrapper}`]: {
    position: 'relative',
  },
  [`& .${classes.formField}`]: {
    ...theme.helpers.baseFont,
    marginBottom: '8px',
    width: '100%',
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
  validationSchema: (props) => {
    return props.EmailCaptureSchema
  },
  mapPropsToValues: ({
    user,
    soundcloudAccount,
    twitterAccount,
    publicKey,
  }) => {
    return {
      email: user ? user.email : '',
      soundcloud: soundcloudAccount ? soundcloudAccount : soundcloudAccount,
      twitter: twitterAccount ? twitterAccount : '',
      instagram: '',
      wallet: user ? user.publicAddress : publicKey?.toString(),
      type: 'artist',
    }
  },
})(EmailCaptureForm)
