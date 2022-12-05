import React, {useEffect, useState, createElement, Fragment, useRef, useMemo} from 'react'
import ReactQuill from 'react-quill';
import dynamic from 'next/dynamic';
import {styled} from "@mui/material/styles";

const QuillNoSSRWrapper = dynamic(
  async () => {
    const {default: RQ} = await import('react-quill');
    // eslint-disable-next-line react/display-name
    return ({forwardedRef, ...props}) => <RQ ref={forwardedRef} {...props} />;
  },
  {ssr: false}
);
import Box from "@mui/material/Box";

// import {MagicUrl} from 'quill-magic-url'
const {Quill} = ReactQuill

import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'
import MagicUrl from 'quill-magic-url';

const QuillEditor = ({formikProps, type, update}) => {
  const quillRef = useRef(null)

  const theme = type === "release" ? "bubble" : "snow";
  // const [valuePlaced, setValuePlaced] = useState(false);


  useEffect(() => {
      if (Quill) {
        const MagicUrl = require("quill-magic-url").default; // Install with 'yarn add quill-magic-url'
        Quill.register("modules/magicUrl", MagicUrl);
        console.log('MagicUrl :>> ', MagicUrl);
        var Link = Quill.import("formats/link");
        var builtInFunc = Link.sanitize;
        Link.sanitize = function customSanitizeLinkInput(linkValueInput) {
          var val = linkValueInput;

          // do nothing, since this implies user's already using a custom protocol
          if (/^\w+:/.test(val));
          else if (!/^https?:/.test(val)) val = "http://" + val;

          return builtInFunc.call(this, val); // retain the built-in logic
        };
      }
  }, [Quill])

  let toolbarValues;
  let height;
  switch (type) {
    case "release":
      toolbarValues = false;
      height = "100px";
      break;
    case "hub":
      toolbarValues = [
        [{header: [1, 2, 3, 4, 5, false]}],
        ["bold", "italic", "underline", "strike"],
        [{script: "sub"}, {script: "super"}],
        ["link"],
      ];
      height = "110px";
      break;
    case "post":
      toolbarValues = [
        [{header: [1, 2, 3, 4, 5, false]}],
        ["bold", "italic", "underline", "strike"],
        [{script: "sub"}, {script: "super"}],
        ["link"],
      ];
      height = "300px";
      break;

    default:
      break;
  }
  const modules = useMemo(() => ({
      toolbar: toolbarValues,
      clipboard: {
        matchVisual: false,
      },
      magicUrl: true
  }), [])

  // useEffect(() => {
  //   if (update && formikProps.field.value.includes("<p>")) {
  //     unified()
  //       .use(rehypeParse, {fragment: true})
  //       .use(rehypeSanitize)
  //       .use(rehypeReact, {
  //         createElement,
  //         Fragment,
  //       })
  //       .use(rehypeExternalLinks, {
  //         target: false,
  //         rel: ["nofollow", "noreferrer"],
  //       })
  //       .process(
  //         JSON.parse(formikProps.field.value).replaceAll("<p><br></p>", "<br>")
  //       )
  //       .then((file) => {
  //         console.log('file :>> ', file);
  //         setInitialValue(file.value)
  //         console.log('Quill :>> ', QuillNoSSRWrapper);          
  //       });
  //   }
  // }, [update]);

  const initialValue = useMemo(() => {
    if (update && formikProps.field.value.includes("<p>")) {
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
          JSON.parse(formikProps.field.value).replaceAll("<p><br></p>", "<br>")
        )
        .then((file) => {
          console.log('file :>> ', file);
          console.log('Quill :>> ', QuillNoSSRWrapper);
          return file.value
        });
    }
  }, [update])



  const removeQuotesFromStartAndEndOfString = (string) => {
    return string.substring(1, string.length - 1).substring(-1, string.length - 1);
  }

  const handleChange = (content, delta, source, editor) => {
    formikProps.form.setFieldValue(
      formikProps.field.name,
      JSON.stringify(content)
    )
    setInitialValue(content)
  }
  return (
    <QuillWrapper type={type}>
      <Box style={{height}}>
        <QuillNoSSRWrapper
        forwardedRef={quillRef} 
        theme={theme}
        modules={modules}
        onChange={handleChange}
        // defaultValue={removeQuotesFromStartAndEndOfString(initialValue) || null}
        // defaultValue={initialValue}
        value={initialValue}
        ></QuillNoSSRWrapper>
      </Box>

    </QuillWrapper>
  );
}

const QuillWrapper = styled(Box)(({theme, type}) => ({
  "& .ql-editor": {
    padding: type === "release" ? "0px" : "",
    maxHeight: type === "release" ? "100px" : "unset",
    overflow: "auto",
    maxWidth: "476px",
  },
}));
export default QuillEditor