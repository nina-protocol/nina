import React, { useEffect } from 'react'
import { styled } from '@mui/material/styles'
import { withFormik, Form, Field } from 'formik'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import FormLabel from '@mui/material/FormLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import FormControlLabel from '@mui/material/FormControlLabel'
import { formatPlaceholder } from '../utils/index.js'
import {display} from '@material-ui/system'

const EmailCaptureForm = ({
  values,
  onChange,
  errors,
  touched,
  setFieldValue,
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
                InputLabelProps={touched.soundcloud ? { shrink: true } : ''}
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
                InputLabelProps={touched.twitter ? { shrink: true } : ''}
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
        <Box sx={{ mt: 2 }}>
          <FormLabel>I want to use Nina as:</FormLabel>
          <RadioGroup
            sx={{ 
              mt: 1, 
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
            }}
            defaultValue="artist"
            name="type"
            onChange={(e) => setFieldValue('type', e.target.value)}
            row
          >
            <FormControlLabel
              value="artist"
              control={<Radio />}
              label="An Artist"
            />
            <FormControlLabel
              value="label"
              control={<Radio />}
              label="A Label"
            />
            <FormControlLabel
              value="writer"
              control={<Radio />}
              label="A Writer"
            />
            <FormControlLabel
              value="curator"
              control={<Radio />}
              label="A Curator"
            />
            <FormControlLabel
              value="listener"
              control={<Radio />}
              label="A Listener"
            />
            <FormControlLabel value="other" control={<Radio />} label="Other" />
          </RadioGroup>
        </Box>
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
  [theme.breakpoints.down('md')]: {
    width: '90%',
  },
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
  mapPropsToValues: () => {
    return {
      email: '',
      soundcloud: '',
      twitter: '',
      instagram: '',
      wallet: undefined,
      type: 'artist',
    }
  },
})(EmailCaptureForm)
