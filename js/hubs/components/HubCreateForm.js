import React, { useEffect } from "react";
import { styled } from "@mui/material/styles";
import nina from "@nina-protocol/nina-sdk";
import { withFormik, Form, Field } from "formik";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import HelpIcon from "@mui/icons-material/Help";

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
            through this hub will send to the Hub.
          </div>
          <div style={{ paddingBottom: "15px" }}>
            ie: a 5% Publish Fee means the publisher of the release will have
            95% of their revnue and the hub has 5%.
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
            <Box>
              <TextField
                className="formField"
                variant="standard"
                label={formatPlaceholder(props.field.name)}
                size="small"
                multiline
                rows={3}
                InputLabelProps={touched.description ? { shrink: true } : ""}
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
  );
};

const Root = styled("div")(() => ({
  margin: "auto",
  width: "100%",
}));

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
