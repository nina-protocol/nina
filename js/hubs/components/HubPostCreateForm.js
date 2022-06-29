import React, { useContext, useEffect } from "react";
import { styled } from "@mui/material/styles";
import nina from "@nina-protocol/nina-sdk";
import { withFormik, Form, Field } from "formik";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Quill from './Quill'

const { formatPlaceholder } = nina.utils;
const { ReleaseContext } = nina.contexts;

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
  preloadedRelease,
}) => {
  const { releaseState } = useContext(ReleaseContext);

  useEffect(() => {
    if (onChange) {
      onChange(values);
    }
  }, [values]);

  useEffect(() => {
    if (postCreated) {
      resetForm();
    }
  }, [postCreated]);

  return (
    <Root>
      <Form style={{ padding: "0 15px", height: "100%" }}>
        <Field name="title">
          {(props) => (
            <Box>
              <TextField
                className="formField"
                variant="standard"
                label={
                  formatPlaceholder(props.field.name) +
                  (update ? ` (${hubData.json.title})` : "")
                }
                size="small"
                InputLabelProps={touched.title ? { shrink: true } : ""}
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
              <Quill props={props} type={'post'} postCreated={postCreated} />
            </Box>
          )}
        </Field>

        {!preloadedRelease && (
          <Field name="reference">
            {(props) => (
              <FormControl fullWidth>
                <Select
                  className="formField"
                  value={props.field.value}
                  placeholder="Release Reference"
                  displayEmpty
                  onChange={(e) => {
                    props.form.setFieldValue("reference", e.target.value);
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
                    );
                  })}
                </Select>
              </FormControl>
            )}
          </Field>
        )}

        {preloadedRelease && (
          <Typography mt={1}>
            <i>{releaseState.metadata[preloadedRelease].name}</i> will be
            associated with this post
          </Typography>
        )}
      </Form>
    </Root>
  );
};

const Root = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
}));

export default withFormik({
  enableReinitialize: true,
  validationSchema: (props) => {
    return props.PostCreateSchema;
  },
  mapPropsToValues: () => {
    return {
      title: "",
      body: null,
      reference: "",
    };
  },
})(HubPostCreateForm);
