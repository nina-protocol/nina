import React, { useEffect } from 'react'
import { styled } from '@mui/material/styles'
import { withFormik, Form, Field } from 'formik'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Slider from '@mui/material/Slider'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import nina from '@nina-protocol/nina-sdk'
import Quill from './Quill'

const { formatPlaceholder } = nina.utils

const ReleaseCreateForm = ({
  field,
  form,
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

  const valuetext = (value) => {
    return `${value}%`
  }

  return (
    <Root>
      <Form>
        <Field name="artist">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="standard"
                label={formatPlaceholder(props.field.name)}
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

        <Field name="title">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="standard"
                label={formatPlaceholder(props.field.name)}
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

        <Field name="catalogNumber">
          {({ field }) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={`${classes.formField}`}
                variant="standard"
                label={formatPlaceholder(field.name)}
                size="small"
                InputLabelProps={touched.catalogNumber ? { shrink: true } : ''}
                placeholder={
                  errors.catalogNumber && touched.catalogNumber
                    ? errors.catalogNumber
                    : null
                }
                inputProps={{ maxLength: 10 }}
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
            </Box>
          )}
        </Field>

        <Field name="amount">
          {({ field }) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={`${classes.formField}`}
                variant="standard"
                label={formatPlaceholder('Edition Size')}
                size="small"
                type="number"
                InputLabelProps={touched.amount ? { shrink: true } : ''}
                placeholder={
                  errors.amount && touched.amount ? errors.amount : null
                }
                InputProps={{
                  onChange: (event) => {
                    let whole = parseInt(event.target.value)
                    setFieldValue('amount', whole)
                  },
                }}
                {...field}
              />
            </Box>
          )}
        </Field>

        <Field name="retailPrice">
          {({ field }) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={`${classes.formField}`}
                variant="standard"
                label={formatPlaceholder('Price')}
                size="small"
                InputLabelProps={touched.retailPrice ? { shrink: true } : ''}
                placeholder={
                  errors.retailPrice && touched.retailPrice
                    ? errors.retailPrice
                    : null
                }
                type="number"
                {...field}
              />
            </Box>
          )}
        </Field>

        <Box className={`${classes.formField}`} width="100%">
          <Typography
            id="discrete-slider-custom"
            align="left"
            style={{
              color: 'rgba(0, 0, 0, 0.54)',
              fontSize: '12px',
              marginTop: '8px',
            }}
          >
            RESALE PERCENTAGE: {values.resalePercentage}%
          </Typography>
          <Box>
            <Slider
              defaultValue={0}
              getAriaValueText={valuetext}
              aria-labelledby="percent"
              className={classes.formField}
              step={1}
              min={0}
              max={100}
              value={values.resalePercentage}
              name="resalePercentage"
              onChange={(event, value) => {
                setFieldValue('resalePercentage', value)
              }}
              {...field}
              {...form}
            />
            <Fade in={values.resalePercentage > 20}>
              <Warning variant="subtitle1" align="left">
                Are you certain about a {values.resalePercentage}% resale fee?
                High resale may discourage potential collectors.
              </Warning>
            </Fade>

            <Field name="description">
              {(props) => (
                <Box sx={{borderBottom: '1px solid grey'}}>
                  <Quill props={props} type={'release'} update={false} />
                </Box>
              )}
            </Field>

          </Box>
        </Box>
      </Form>
    </Root>
  )
}
const PREFIX = 'ReleaseCreateForm'

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
    position: 'relative',
    '& input': {
      textAlign: 'left',
      '&::placeholder': {
        color: theme.palette.red,
      },
    },
  },
}))

const Warning = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  textTransform: 'none !important',
  color: theme.palette.red,
  opacity: '85%',
  top: '-5%',
  left: '122%',
  width: '220px'
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
      resalePercentage: 10,
    }
  },
})(ReleaseCreateForm)
