import React, { useEffect, useState, useRef } from 'react'
import { styled } from '@mui/material/styles'
import { withFormik, Form, Field } from 'formik'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Slider from '@mui/material/Slider'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { formatPlaceholder } from '@nina-protocol/nina-internal-sdk/esm/utils'
import dynamic from 'next/dynamic'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
// import QuillEditor from './QuillEditor'
const QuillEditor = dynamic(() => import('./QuillEditor'), { ssr: false })

const ReleaseCreateForm = ({
  field,
  form,
  values,
  onChange,
  errors,
  setFieldValue,
  touched,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(undefined)
  const editionRef = useRef(isOpen)
  const infinityUnicode = '\u221e'

  useEffect(() => {
    if (onChange) {
      onChange(values)
    }
    console.log('values', values)
  }, [values])

  useEffect(() => {
    if (isOpen) {
      const infin = '\u221e'
      setFieldValue('isOpen', true)
      setInputValue(infin)
      setFieldValue('amount', infin)
    }
    if (!isOpen) {
      setFieldValue('isOpen', false)
    }
  }, [isOpen])

  const valuetext = (value) => {
    return `${value}%`
  }

  const handleEditionChange = (event) => {
    editionRef.current = event.target.value
    if (editionRef.current === 'unlimited') {
      setIsOpen(true)
    }
    if (editionRef.current === 'limited') {
      setIsOpen(false)
    }
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
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
                {...field}
              />
            </Box>
          )}
        </Field>
        <Box
          className={classes.fieldInputWrapper}
          sx={{ display: 'flex', alignItems: 'left', textAlign: 'center' }}
        >
          <FormControl sx={{ flexDirection: 'row' }}>
            <FormLabel
              sx={{ marginTop: '10px', color: 'gray' }}
              focused={false}
            >
              EDITION TYPE
            </FormLabel>{' '}
            <RadioGroup
              row
              aria-labelledby="amount"
              defaultValue={editionRef.current}
            >
              <FormControlLabel
                value="limited"
                disableRipple
                control={<FormRadio />}
                label="Limited"
                onClick={(event) => handleEditionChange(event)}
                sx={{ marginLeft: '1px', marginRight: '5px' }}
                checked={!isOpen}
                disabled={disabled}
              />
              <FormControlLabel
                value="unlimited"
                disableRipple
                control={<FormRadio />}
                label="Unlimited"
                onClick={(event) => handleEditionChange(event)}
                checked={isOpen}
                disabled={disabled}
              />
            </RadioGroup>
          </FormControl>
        </Box>
        <Field name="amount">
          {({ field }) => (
            <Box className={classes.fieldInputWrapper} align={'left'}>
              <TextField
                className={`${classes.formField}`}
                variant="standard"
                label={formatPlaceholder('Edition Size')}
                size="small"
                type={isOpen ? 'text' : 'number'}
                InputLabelProps={touched.amount ? { shrink: true } : ''}
                placeholder={
                  errors.amount && touched.amount ? errors.amount : null
                }
                InputProps={{
                  onChange: (event) => {
                    setInputValue(event.target.value)
                    if (!isOpen) {
                      let whole = parseInt(event.target.value)
                      setFieldValue('amount', whole)
                      setFieldValue('isOpen', false)
                    }
                    if (isOpen) {
                      setFieldValue('isOpen', true)
                      setFieldValue('amount', 'Open')
                    }
                  },
                }}
                sx={{
                  '.MuiInputBase-input': {
                    fontSize:
                      inputValue === infinityUnicode ? '22px !important' : '',
                  },
                }}
                disabled={isOpen || disabled}
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
                disabled={disabled}
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
              disabled={disabled}
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
                <Box sx={{ borderBottom: '1px solid grey', height: '14vh' }}>
                  <QuillEditor
                    formikProps={props}
                    type={'release'}
                    update={false}
                  />
                </Box>
              )}
            </Field>
          </Box>
        </Box>
      </Form>
    </Root>
  )
}

const FormRadio = (props) => {
  return (
    <Radio
      disableRipple
      color="default"
      sx={{
        '&&:hover': {
          backgroundColor: 'transparent',
        },
      }}
      {...props}
    />
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
  width: '220px',
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
      editionSize: '10',
      retailPrice: undefined,
      resalePercentage: 10,
      isOpen: false,
    }
  },
})(ReleaseCreateForm)
