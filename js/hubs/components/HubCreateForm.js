import React, { useEffect } from 'react'
import { styled } from '@mui/material/styles'
import nina from '@nina-protocol/nina-sdk'
import { withFormik, Form, Field } from 'formik'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import HelpIcon from '@mui/icons-material/Help'

const { formatPlaceholder } = nina.utils

const HubCreateForm = ({
  field,
  form,
  values,
  onChange,
  errors,
  touched,
  setFieldValue,
  update,
  hubData,
}) => {
  // const baseUrl = 'https://hubs.ninaprotocol.com/'
  useEffect(() => {
    if (onChange) {
      onChange(values)
    }
  }, [values])

  const IconWithTooltip = ({ field }) => {
    let copy
    if (field === 'publishFee') {
      copy = 'publish fee explanation'
    } else {
      copy = 'referall fee explanation'
    }
    return (
      <Tooltip title={`${copy}`}>
        <HelpIcon sx={{ fontSize: '16px !important', marginLeft: '5px' }} />
      </Tooltip>
    )
  }

  return (
    <Root>
      {update && (
        <Typography gutterBottom>
          Updating {hubData.json.displayName}
        </Typography>
      )}
      <Form style={{ padding: '0 15px' }}>
        {!update && (
          <Field name="handle">
            {(props) => (
              <Box>
                <TextField
                  className="formField"
                  variant="standard"
                  label={
                    formatPlaceholder(props.field.name) +
                    " (this will be your hub's permanent identifier)"
                  }
                  size="small"
                  InputLabelProps={touched.handle ? { shrink: true } : ''}
                  placeholder={
                    errors.handle && touched.handle ? errors.handle : null
                  }
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\s+/g, '-')
                      .toLowerCase()
                    const regex = new RegExp(/^[a-zA-Z0-9-]+$/)
                    if (
                      (regex.test(value) || value === '') &&
                      value.length < 100
                    ) {
                      setFieldValue('handle', value)
                      setFieldValue('externalUrl', `https://hubs.ninaprotocol.com/${value}`)
                    }
                  }}
                  value={props.field.value}
                />
              </Box>
            )}
          </Field>
        )}
        <Field name="displayName">
          {(props) => (
            <Box>
              <TextField
                className="formField"
                variant="standard"
                label={
                  formatPlaceholder(props.field.name) +
                  (update
                    ? ` (${hubData.displayName})`
                    : ' (this can be updated any time)')
                }
                size="small"
                InputLabelProps={touched.displayName ? { shrink: true } : ''}
                placeholder={
                  errors.displayName && touched.displayName
                    ? errors.displayName
                    : null
                }
                {...props.field}
              />
            </Box>
          )}
        </Field>
        <Field name="publishFee">
          {(props) => (
            <Box>
              <TextField
                className="formField"
                variant="standard"
                size="small"
                InputLabelProps={touched.title ? { shrink: true } : ''}
                label={
                  <Box display="flex" alignItems="center">
                    {formatPlaceholder(props.field.name) + ' (%)'}
                    <IconWithTooltip field={props.field.name} />
                  </Box>
                }
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
            <Box>
              <TextField
                className="formField"
                variant="standard"
                label={
                  <Box display="flex" alignItems="center">
                    {formatPlaceholder(props.field.name) + ' (%)'}
                    <IconWithTooltip field={props.field.name} />
                  </Box>
                }
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

        <Field name="description">
          {(props) => (
            <Box>
              <TextField
                className="formField"
                variant="standard"
                label={formatPlaceholder(props.field.name)}
                size="small"
                multiline
                rows={3}
                InputLabelProps={touched.description ? { shrink: true } : ''}
                placeholder={
                  errors.description && touched.description
                    ? errors.description
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

const Root = styled('div')(() => ({
  margin: 'auto',
  width: '100%',
}))

export default withFormik({
  enableReinitialize: true,
  validationSchema: (props) => {
    return props.HubCreateSchema
  },
  mapPropsToValues: ({ hubData }) => {
    return {
      handle: '',
      displayName: `${hubData ? hubData.json.displayName : ''}`,
      publishFee: `${hubData ? hubData.publishFee : ''}`,
      referralFee: `${hubData ? hubData.referralFee : ''}`,
      description: `${hubData ? hubData.json.description : ''}`,
      externalUrl: `${hubData ? hubData.json.externalUrl : ''}`,
    }
  },
})(HubCreateForm)
