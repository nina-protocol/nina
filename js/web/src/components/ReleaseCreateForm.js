import React, { useEffect } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { withFormik, Form, Field } from 'formik'
import Typography from '@mui/material/Typography'
import { TextField } from '@mui/material'
import Slider from '@mui/material/Slider'
import Box from '@mui/material/Box'

const { NinaClient } = ninaCommon.utils

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
                variant="standard"
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
                variant="standard"
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
                variant="standard"
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
          {({ field }) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={`${classes.formField}`}
                variant="standard"
                label={NinaClient.formatPlaceholder(field.name)}
                size="small"
                type="number"
                {...field}
              />
              {errors.retailPrice&& touched.amount ? (
                <div className={classes.formError}>{errors.amount}</div>
              ) : null}
            </Box>
          )}
        </Field>

        <Field name="retailPrice">
          {({ field }) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={`${classes.formField}`}
                variant="standard"
                label={NinaClient.formatPlaceholder(field.name)}
                size="small"
                type="number"
                {...field}
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
            style={{ color: 'rgba(0, 0, 0, 0.54)', fontSize: '12px', marginTop: '8px' }}
          >
            RESALE PERCENTAGE: {values.resalePercentage}%
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
  formError: `${PREFIX}-formError`,
  resalePercentageWrapper: `${PREFIX}-resalePercentageWrapper`,
  formSlider: `${PREFIX}-formSlider`,
}

const Root = styled('div')(({ theme }) => ({
  margin: 'auto',
  width: '100%',
  [`& .${classes.fieldInputWrapper}`]: {
    position: 'relative',
  },

  [`& .${classes.formField}`]: {
    marginBottom: '8px',
    width: '100%',
    textTransform: 'capitalize',
    fontSize: '10px',
    position: 'relative',
    '& :placeholder': {
      textTransform: 'capitalize',
    },
    '& input': {
      textAlign: 'left',
    },
  },

  [`& .${classes.formError}`]: {
    position: 'absolute',
    top: '50%',
    right: theme.spacing(1),
    transform: 'translateY(-50%)',
    color: theme.palette.red,
    opacity: '.75',
  },

  [`& .${classes.resalePercentageWrapper}`]: {
    display: 'flex',
    justifyContent: 'space-inbetween',
    alignItems: 'center',
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
