import React, {useEffect, useState, createElement, Fragment} from "react";
import Box from "@mui/material/Box";
import InputLabel from '@mui/material/InputLabel';
import {useQuill} from 'react-quilljs'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import {styled} from "@mui/material/styles";

import {unified} from "unified";
import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import rehypeExternalLinks from "rehype-external-links";

const Quill = ({props, update, type}) => {
  const theme = type === 'release' ? 'bubble' : 'snow'

  const [valuePlaced, setValuePlaced] = useState(false)
  let toolbarValues;
  let height;
  switch (type) {
    case 'release':
      toolbarValues = false
      height = '100px'
      break;
    case 'hub':
      toolbarValues = [
        [{header: [1, 2, 3, 4, 5, false]}],
        ['bold', 'italic', 'underline', 'strike'],
        [{script: 'sub'}, {script: 'super'}],
        ['link'],
      ]
      height = '150px'
      break;
    case 'post':
      toolbarValues = [
        [{header: [1, 2, 3, 4, 5, false]}],
        ['bold', 'italic', 'underline', 'strike'],
        [{script: 'sub'}, {script: 'super'}],
        ['link'],
      ]
      height = '300px'
      break;
  
    default:
      break;
  }
  
  const modules = {
    toolbar: toolbarValues,
    clipboard: {
      matchVisual: false,
    },
    magicUrl: true,
  }

  useEffect(() => {
    if (update) {
      unified()
        .use(rehypeParse, {fragment: true})
        .use(rehypeSanitize)
        .use(rehypeReact, {
          createElement,
          Fragment,
        })
        .use(rehypeExternalLinks, {
          target: false,
          rel: ["nofollow", "noreferrer"],
        })
        .process(
          JSON.parse(props.field.value).replaceAll(
            "<p><br></p>",
            "<br>"
          )
        )
        .then((file) => {
          quill?.setContents([{insert: `${props.field.value}`}])
        });
    }

  }, [update])


  const formats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'header',
    'link',
    'script',
  ]

  const {quill, quillRef, Quill} = useQuill({
    theme,
    modules,
    formats,
  })
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

  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        props.form.setFieldValue(props.field.name, JSON.stringify(quill.root.innerHTML))
      })
    }
  }, [quill])

  useEffect(() => {
    if (update && props.field.value && quill && !valuePlaced) {
      setValuePlaced(true)
      quill.root.innerHTML = props.field.value.slice(1, -1)
    }
  }, [props.field.value, update, quill])

  return (
    <QuillWrapper type={type}>
      {type !== 'post' && (
        <InputLabel
          align="left"
          shrink={props.field.value ? true : ''}>DESCRIPTION</InputLabel>
      )}
      <Box style={{height}} ref={quillRef} />
    </QuillWrapper>
  )
}

const QuillWrapper = styled(Box)(({theme, type}) => ({
  '& .ql-editor': {
    padding: type === 'release' ? '0px' : '',
    maxHeight: type === 'release' ? '100px' : 'unset',
    overflowY: 'scroll'
  }
}))


export default Quill