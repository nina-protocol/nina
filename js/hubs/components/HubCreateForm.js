import React, { useEffect, useState, createElement, Fragment } from "react";
import { styled } from "@mui/material/styles";
import nina from "@nina-protocol/nina-sdk";
import { withFormik, Form, Field } from "formik";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import HelpIcon from "@mui/icons-material/Help";
import {useQuill} from 'react-quilljs'
import 'quill/dist/quill.snow.css'

import {unified} from "unified";
import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import rehypeExternalLinks from "rehype-external-links";



const { formatPlaceholder } = nina.utils;

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
  handleBlur,
}) => {
  useEffect(() => {
    if (onChange) {
      onChange(values);
    }
  }, [values]);

  const IconWithTooltip = ({ field }) => {
    let copy;
    if (field === "publishFee") {
      copy = (
        <div>
          <div style={{ paddingBottom: "15px" }}>
            The Publish Fee sets the % of revenue shares that releases published
            through this hub will send to the hub.
          </div>
          <div style={{ paddingBottom: "15px" }}>
            ie: a 5% Publish Fee means the publisher of the release will have
            95% of the {`release's`} revenue share and the hub will have 5%.
          </div>
          <div style={{ paddingBottom: "15px" }}>
            Publish Fee is optional and can be set to 0%
          </div>
        </div>
      );
    } else {
      copy = (
        <div>
          <div style={{ paddingBottom: "15px" }}>
            The Referral Fee sets the percent of sale price that the hub will
            receive for sales made of tracks reposted from other hubs.
          </div>
          <div style={{ paddingBottom: "15px" }}>
            ie: a 5% Referral Fee. You repost a release from a different hub
            that costs $1. If it is purchased through your hub the buyer pays
            $1.05. You receive $0.05 and the original publisher receives $1.00.{" "}
          </div>
          <div style={{ paddingBottom: "15px" }}>
            Referral Fee is optional and can be set to 0%
          </div>
        </div>
      );
    }
    return (
      <Tooltip title={copy} style={{ whiteSpace: "pre-line" }}>
        <HelpIcon sx={{ fontSize: "16px !important", marginLeft: "5px" }} />
      </Tooltip>
    );
  };

  return (
    <Root>
      {update && (
        <Typography gutterBottom>
          Updating {hubData.json.displayName}
        </Typography>
      )}
      <Form style={{ padding: "0 15px" }}>
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
                  InputLabelProps={touched.handle ? { shrink: true } : ""}
                  placeholder={
                    errors.handle && touched.handle ? errors.handle : null
                  }
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\s+/g, "-")
                      .toLowerCase();
                    const regex = new RegExp(/^[a-zA-Z0-9-]+$/);
                    if (
                      (regex.test(value) || value === "") &&
                      value.length < 100
                    ) {
                      setFieldValue("handle", value);
                      setFieldValue(
                        "externalUrl",
                        `https://hubs.ninaprotocol.com/${value}`
                      );
                    }
                  }}
                  onBlur={() => (touched.handle = true)}
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
                    : " (this can be updated any time)")
                }
                size="small"
                InputLabelProps={touched.displayName ? { shrink: true } : ""}
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
                InputLabelProps={touched.publishFee ? { shrink: true } : ""}
                type="number"
                label={
                  <Box display="flex" alignItems="center">
                    {formatPlaceholder(props.field.name) + " (%)"}
                    <IconWithTooltip field={props.field.name} />
                  </Box>
                }
                InputProps={{
                  inputProps: {
                    max: 100,
                    min: 0,
                  },
                  onChange: (e) => {
                    const value = e.target.value
                      ? parseInt(e.target.value)
                      : "";
                    if (value > 100) {
                      value = 100;
                    }
                    if (value < 0) {
                      value = 0;
                    }
                    setFieldValue("publishFee", value);
                  },
                }}
                placeholder={
                  errors.publishFee && touched.publishFee
                    ? errors.publishFee
                    : null
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
                    {formatPlaceholder(props.field.name) + " (%)"}
                    <IconWithTooltip field={props.field.name} />
                  </Box>
                }
                size="small"
                InputLabelProps={touched.referralFee ? { shrink: true } : ""}
                type="number"
                InputProps={{
                  inputProps: {
                    max: 100,
                    min: 0,
                  },
                  onChange: (e) => {
                    const value = e.target.value
                      ? parseInt(e.target.value)
                      : "";
                    if (value > 100) {
                      value = 100;
                    }
                    if (value < 0) {
                      value = 0;
                    }
                    setFieldValue("referralFee", value);
                  },
                }}
                placeholder={
                  errors.referralFee && touched.referralFee
                    ? errors.referralFee
                    : null
                }
                {...props.field}
              />
            </Box>
          )}
        </Field>

        <Field name="description">
          {(props) => (
            <Box sx={{mb: '8px'}}>
              <Quill props={props} update={update} />
            </Box>
          )}
        </Field>
      </Form>
    </Root>
  );
};

const Root = styled("div")(() => ({
  margin: "auto",
  width: "100%",
}));

const Quill = ({props, update}) => {
  const theme = 'snow'
  console.log('props :>> ', props);
  const [placeholder, setPlaceholder] = useState('testests')
  const [valuePlaced, setValuePlaced] = useState(false)
  const modules = {
    toolbar: [
      [{header: [1, 2, 3, 4, 5, 6, false]}],
      ['bold', 'italic', 'underline', 'strike'],
      [{script: 'sub'}, {script: 'super'}],
      ['link'],
    ],
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
          console.log('file.result :>> ', file.result);
          quill?.setContents([{insert: `${props.field.value}`}])
          setPlaceholder(file.result);
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
    // placeholder,
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
        props.form.setFieldValue('description', JSON.stringify(quill.root.innerHTML))
      })
    }
  }, [quill])

  useEffect(() => {
    if (update && props.field.value && quill && !valuePlaced) {
      setValuePlaced(true)
      quill.root.innerHTML = props.field.value.slice(1, -1 )
    }
  }, [props.field.value, update, quill])

  return <Box style={{height: '150px'}} ref={quillRef} />
}

export default withFormik({
  enableReinitialize: true,
  validationSchema: (props) => {
    return props.HubCreateSchema;
  },
  mapPropsToValues: ({ hubData }) => {
    return {
      handle: "",
      displayName: `${hubData ? hubData.json.displayName : ""}`,
      publishFee: `${hubData ? hubData.publishFee : ""}`,
      referralFee: `${hubData ? hubData.referralFee : ""}`,
      description: `${hubData ? hubData.json.description : ""}`,
      externalUrl: `${hubData ? hubData.json.externalUrl : ""}`,
    };
  },
})(HubCreateForm);
