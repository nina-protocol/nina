import React, {useEffect, useState, createElement, Fragment, useRef, useMemo} from 'react'
import ReactQuill from 'react-quill';
import {stripQuotesIfNeeded} from "@nina-protocol/nina-internal-sdk/esm/utils";
import dynamic from 'next/dynamic';
import {styled} from "@mui/material/styles";
import InputLabel from "@mui/material/InputLabel";

const QuillNoSSRWrapper = dynamic(
  async () => {
    const {default: RQ} = await import('react-quill');
    // eslint-disable-next-line react/display-name
    return ({forwardedRef, ...props}) => <RQ ref={forwardedRef} {...props} />;
  },
  {ssr: false}
);
import Box from "@mui/material/Box";

const {Quill} = ReactQuill

import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

const QuillEditor = ({formikProps, type, update}) => {
  const quillRef = useRef(null)
  const theme = type === "release" ? "bubble" : "snow";
  const [initialValue, setInitialValue] = useState()
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

  useEffect(() => {
    if (Quill) {
      const MagicUrl = require("quill-magic-url").default; // Install with 'yarn add quill-magic-url'
      Quill.register("modules/magicUrl", MagicUrl);
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



  const handleChange = (content, delta, source, editor) => {
    console.log('content before replace:>> ', content);
    content = content.replaceAll("<p><br></p>", "<br>")
    formikProps.form.setFieldValue(formikProps.field.name, content)
    console.log('content :>> ', content);
  }
  return (
    <QuillWrapper type={type} height={height}>
      {type !== "post" && (
        <InputLabel align="left" shrink={formikProps.field.value ? true : ""}>
          DESCRIPTION
        </InputLabel>
      )}
      <QuillNoSSRWrapper
        forwardedRef={quillRef}
        theme={theme}
        modules={modules}
        onChange={handleChange}
        defaultValue={stripQuotesIfNeeded(formikProps.field.value)}
      >
      </QuillNoSSRWrapper>
    </QuillWrapper>
  );
}

const QuillWrapper = styled(Box)(({theme, type, height}) => ({
  "& .ql-editor": {
    padding: type === "release" ? "0px" : "",
    maxHeight: type === "release" ? "100px" : height,
    height: type === "release" ? "100px" : height,
    overflow: "auto",
    maxWidth: "476px",
  },
}));

export default QuillEditor