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
  pressingFee
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
              {console.log(touched)}
              <TextField
                className={classes.formField}
                variant="standard"
                label={NinaClient.formatPlaceholder(props.field.name)}
                size="small"
                InputLabelProps={ touched.artist ? {shrink: true} : ''}
                {...props.field}
              />
              {errors.artist && touched.artist ? (
                <FormError>
                  {errors.artist}
                </FormError>
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
                InputLabelProps={touched.title? {shrink: true} : ''}
                {...props.field}
              />
              {errors.title && touched.title ? (
                <FormError>
                  {errors.title}
                </FormError>
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
                InputLabelProps={touched.description ? {shrink: true} : ''}
                {...props.field}
              />
              {errors.description && touched.description ? (
                <FormError>
                  {errors.description}
                </FormError>
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
                InputLabelProps={touched.catalogNumber ? {shrink: true} : ''}
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
                <FormError>
                  {errors.catalogNumber}
                </FormError>
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
                InputLabelProps={touched.amount ? {shrink: true} : ''}
                type="number"
                {...field}
              />
              {errors.retailPrice&& touched.amount ? (
                <FormError>
                  {errors.amount}
                </FormError>
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
                InputLabelProps={touched.retailPrice ? {shrink: true} : ''}
                type="number"
                {...field}
              />
              {errors.retailPrice && touched.retailPrice ? (
                <FormError>
                  {errors.retailPrice}
                </FormError>
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
          <Box>
            <Slider
              defaultValue={20}
              getAriaValueText={valuetext}
              aria-labelledby="percent"
              className={classes.formField}
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

      {pressingFee > 0 && (
        <Typography variant="body2" align="left">
          Pressing Fee: {pressingFee} ({values.catalogNumber})
        </Typography>
      )}
    </Root>
  )
}
const PREFIX = 'ReleaseCreateForm'

const classes = {
  fieldInputWrapper: `${PREFIX}-fieldInputWrapper`,
  formField: `${PREFIX}-formField`,
}

const Root = styled('div')(() => ({
  margin: 'auto',
  width: '300px',
  // padding: '50px',
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

}))

const FormError = styled(Typography)(({theme}) => ({
  position: 'absolute',
  top: '50%',
  left: 0,
  transform: 'translateY(-50%)',
  color: theme.palette.red,
  opacity: '.75',
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
