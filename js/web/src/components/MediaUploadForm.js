import React, { useEffect } from 'react'
import ninaCommon from 'nina-common'
import { withFormik, Form, Field } from 'formik'
import { makeStyles } from '@material-ui/core/styles'
import { TextField } from '@material-ui/core'

const { NinaClient } = ninaCommon.utils

function MediaUploadForm({ values, onChange, errors, touched }) {
  const classes = useStyles()

  useEffect(() => {
    if (onChange) {
      onChange(values)
    }
  }, [values])

  return (
    <div>
      <Form>
        <Field name="artist">
          {(props) => (
            <>
              <TextField
                className={classes.formField}
                variant="outlined"
                label={NinaClient.formatPlaceholder(props.field.name)}
                size="small"
                {...props.field}
              />
            </>
          )}
        </Field>
        {errors.artist && touched.artist ? (
          <div className={classes.formError}>{errors.artist}</div>
        ) : null}
        <Field name="title">
          {(props) => (
            <>
              <TextField
                className={classes.formField}
                variant="outlined"
                label={NinaClient.formatPlaceholder(props.field.name)}
                size="small"
                {...props.field}
              />
            </>
          )}
        </Field>
        {errors.title && touched.title ? (
          <div className={classes.formError}>{errors.title}</div>
        ) : null}
        <Field name="description">
          {(props) => (
            <>
              <TextField
                className={classes.formField}
                variant="outlined"
                label={NinaClient.formatPlaceholder(props.field.name)}
                size="small"
                {...props.field}
              />
            </>
          )}
        </Field>
        {errors.description && touched.description ? (
          <div className={classes.formError}>{errors.description}</div>
        ) : null}
      </Form>
    </div>
  )
}

export default withFormik({
  mapPropsToValues: () => {
    return {
      releasePubkey: '',
      track: {},
      artist: '',
      title: '',
      description: '',
      image: {},
    }
  },
})(MediaUploadForm)

const useStyles = makeStyles(() => ({
  formField: {
    margin: '0.5rem 1rem 0.5rem 0',
    width: '100%',
    textTransform: 'capitalize',
    fontSize: '10px',
    '& :placeholder': {
      textTransform: 'capitalize',
      lineHeight: 'normal',
      border: '2px solid red',
    },
    '& input': {
      textAlign: 'left',
      height: '1rem',
    },
  },
  formSlider: {
    '& MuiSlider-markLabel': {
      border: '2px solid red',
      marginLeft: '0',
    },
  },
}))
