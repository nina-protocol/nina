import React, { useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles'
// import nina from '@nina-protocol/nina-sdk'
import { withFormik, Form, Field } from 'formik'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import { useQuill } from 'react-quilljs'
import 'quill/dist/quill.snow.css'

const { formatPlaceholder } = '../utils'
const { ReleaseContext } ='../contexts'

const HubPostCreateForm = ({
  field,
  form,
  values,
  onChange,
  errors,
  touched, 
  setFieldValue,
  update,
  hubData,
  postCreated,
  resetForm,
  hubReleasesToReference,
}) => {
  const { releaseState } = useContext(ReleaseContext)

  useEffect(() => {
    if (onChange) {
      onChange(values)
    }
  }, [values])

  useEffect(() => {
    if (postCreated) {
      resetForm()
    }
  }, [postCreated])

  return (
    <Root>
      {update && <Typography>Updating {hubData.name}</Typography>}
      <Form style={{ padding: '0 15px', height: '100%' }}>
        <Field name="title">
          {(props) => (
            <Box>
              <TextField
                className="formField"
                variant="standard"
                label={
                  formatPlaceholder(props.field.name) +
                  (update ? ` (${hubData.json.title})` : '')
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

        <Field name="body">
          {(props) => (
            <Box>
              <Quill props={props} postCreated={postCreated} />
            </Box>
          )}
        </Field>

        <Field name="reference">
          {(props) => (
            <FormControl fullWidth>
              <Select
                className="formField"
                value={props.field.value}
                placeholder="Release Reference"
                displayEmpty
                onChange={(e) => {
                  props.form.setFieldValue('reference', e.target.value)
                }}
              >
                <MenuItem disabled value="">
                  Reference a release in Post? (Optional)
                </MenuItem>
                {hubReleasesToReference.map((hubRelease) => {
                  return (
                    <MenuItem
                      key={hubRelease.release}
                      value={hubRelease.release}
                    >
                      {releaseState.metadata[hubRelease.release]?.name}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          )}
        </Field>
      </Form>
    </Root>
  )
}

const Quill = ({ props, postCreated }) => {
  const theme = 'snow'

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ script: 'sub' }, { script: 'super' }],
      ['link'],
    ],
    clipboard: {
      matchVisual: false,
    },
  }

  const placeholder = ''

  const formats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'header',
    'link',
    'script',
  ]

  const { quill, quillRef } = useQuill({ theme, modules, formats, placeholder })

  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        props.form.setFieldValue('body', JSON.stringify(quill.root.innerHTML))
      })
    }
  }, [quill])

  useEffect(() => {
    if (postCreated) {
      quill?.setContents([{ insert: '\n' }])
    }
  }, [postCreated])

  return <Box style={{ height: '300px' }} ref={quillRef} />
}

const Root = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
}))

export default withFormik({
  enableReinitialize: true,
  validationSchema: (props) => {
    return props.PostCreateSchema
  },
  mapPropsToValues: () => {
    return {
      title: '',
      body: null,
      reference: '',
    }
  },
})(HubPostCreateForm)
