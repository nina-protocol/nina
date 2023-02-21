import React, { useEffect, useRef, useMemo } from 'react'
import ReactQuill from 'react-quill'
import { stripQuotesIfNeeded } from '@nina-protocol/nina-internal-sdk/esm/utils'
import dynamic from 'next/dynamic'
import { styled } from '@mui/material/styles'
import InputLabel from '@mui/material/InputLabel'

const QuillNoSSRWrapper = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill')
    // eslint-disable-next-line react/display-name
    return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />
  },
  { ssr: false }
)
import Box from '@mui/material/Box'

const { Quill } = ReactQuill

const QuillEditor = ({ formikProps, type }) => {
  const quillRef = useRef(null)
  const theme = type === 'release' ? 'bubble' : 'snow'

  const imageHandler = async () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async() => {
      const file = input.files ? input.files[0] : null
      
      const quillObj = quillRef.current.getEditor()
      const range = quillObj.getSelection(true)

      if (file){
        console.log('yoyo', file)
        const formData = new FormData()
        // append file to form data and declare type
        formData.append('image', file)
        formData.append('resource_type', 'raw')
        console.log(formData)
        // handlers go here

        // inset image into quill, pass in endpoint instead of file in this instance
        quillObj.insertEmbed(
          range.index,
          'image',
          'https://res.cloudinary.com/nina-protocol/image/upload/v1634040000/nina-protocol/og-image.png'
        )
      }

    }
  }

  let toolbarValues
  let height
  switch (type) {
    case 'release':
      toolbarValues = false
      height = '65px'
      break
    case 'hub':
      toolbarValues = [
        [{ header: [1, 2, 3, 4, 5, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ script: 'sub' }, { script: 'super' }],
        ['link'],
      ]
      height = '110px'
      break
    case 'post':
      toolbarValues = [
        [{ header: [1, 2, 3, 4, 5, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ script: 'sub' }, { script: 'super' }],
        ['link', 'image'],
      ]
      height = '300px'
      break

    default:
      break
  }
  const modules = useMemo(
    () => ({
      toolbar: {
        container: toolbarValues,
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
      magicUrl: true,
    }),
    []
  )

  useEffect(() => {
    if (Quill) {
      const MagicUrl = require('quill-magic-url').default // Install with 'yarn add quill-magic-url'
      Quill.register('modules/magicUrl', MagicUrl)
      var Link = Quill.import('formats/link')
      var builtInFunc = Link.sanitize
      Link.sanitize = function customSanitizeLinkInput(linkValueInput) {
        var val = linkValueInput

        // do nothing, since this implies user's already using a custom protocol
        if (/^\w+:/.test(val));
        else if (!/^https?:/.test(val)) val = 'http://' + val

        return builtInFunc.call(this, val) // retain the built-in logic
      }
    }
  }, [Quill])

  const handleChange = (content) => {
    content = content.replaceAll('<p><br></p>', '<br>')
    formikProps.form.setFieldValue(formikProps.field.name, content)
  }
  return (
    <>
      {type !== 'post' && (
        <InputLabel align="left" shrink={formikProps.field.value ? true : ''}>
          DESCRIPTION
        </InputLabel>
      )}
      <QuillWrapper type={type} height={height} style={{ height: height }}>
        <QuillNoSSRWrapper
          forwardedRef={quillRef}
          theme={theme}
          modules={modules}
          onChange={handleChange}
          defaultValue={stripQuotesIfNeeded(formikProps.field.value)}
        ></QuillNoSSRWrapper>
      </QuillWrapper>
    </>
  )
}

const QuillWrapper = styled(Box)(({ type, height }) => ({
  '& .ql-editor': {
    padding: type === 'release' ? '0px' : '',
    maxHeight: height,
    height: height,
    overflow: 'auto',
    width: '100%',
  },
}))

export default QuillEditor
