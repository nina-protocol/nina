import React, { useEffect } from "react";
import { styled } from "@mui/material/styles";
import nina from "@nina-protocol/nina-sdk";
import { withFormik, Form, Field } from "formik";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";

const { formatPlaceholder } = nina.utils;

const ReleaseCreateForm = ({
  field,
  form,
  values,
  onChange,
  errors,
  touched,
  setFieldValue,
  disabled,
}) => {
  useEffect(() => {
    if (onChange) {
      onChange(values);
    }
  }, [values]);

  const valuetext = (value) => {
    return `${value}%`;
  };

  return (
    <Root>
      <Form>
        <Field name="artist">
          {(props) => (
            <Box>
              <TextField
                className="formField"
                variant="standard"
                label={formatPlaceholder(props.field.name)}
                size="small"
                InputLabelProps={touched.artist ? { shrink: true } : ""}
                placeholder={
                  errors.artist && touched.artist ? errors.artist : null
                }
                disabled={disabled}
                {...props.field}
              />
            </Box>
          )}
        </Field>

        <Field name="title">
          {(props) => (
            <Box>
              <TextField
                className="formField"
                variant="standard"
                label={formatPlaceholder(props.field.name)}
                size="small"
                InputLabelProps={touched.title ? { shrink: true } : ""}
                placeholder={
                  errors.title && touched.title ? errors.title : null
                }
                disabled={disabled}
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
                disabled={disabled}
                {...props.field}
              />
            </Box>
          )}
        </Field>

        <Field name="catalogNumber">
          {({ field }) => (
            <Box>
              <TextField
                className="formField"
                variant="standard"
                label={formatPlaceholder(field.name)}
                size="small"
                InputLabelProps={touched.catalogNumber ? { shrink: true } : ""}
                placeholder={
                  errors.catalogNumber && touched.catalogNumber
                    ? errors.catalogNumber
                    : null
                }
                inputProps={{ maxLength: 10 }}
                InputProps={{
                  onChange: (event) => {
                    let sanitized = event.target.value
                      .replace(/\s/g, "")
                      .toUpperCase();
                    setFieldValue("catalogNumber", sanitized);
                  },
                }}
                disabled={disabled}
                {...field}
              />
            </Box>
          )}
        </Field>

        <Field name="amount">
          {({ field }) => (
            <Box>
              <TextField
                className="formField"
                variant="standard"
                label={formatPlaceholder(field.name)}
                size="small"
                InputLabelProps={touched.amount ? { shrink: true } : ""}
                placeholder={
                  errors.amount && touched.amount ? errors.amount : null
                }
                type="number"
                {...field}
                disabled={disabled}
              />
            </Box>
          )}
        </Field>

        <Field name="retailPrice">
          {({ field }) => (
            <Box>
              <TextField
                className="formField"
                variant="standard"
                label={`${formatPlaceholder(field.name)} ($)`}
                size="small"
                InputLabelProps={touched.retailPrice ? { shrink: true } : ""}
                placeholder={
                  errors.retailPrice && touched.retailPrice
                    ? errors.retailPrice
                    : null
                }
                type="number"
                disabled={disabled}
                {...field}
              />
            </Box>
          )}
        </Field>

        <Box className={`${classes.formField}`} width="100%">
          <Typography
            id="discrete-slider-custom"
            align="left"
            sx={{
              color: "rgba(0, 0, 0, 0.6) !important",
              fontSize: "12px",
              marginTop: "8px !important",
            }}
          >
            RESALE PERCENTAGE: {values.resalePercentage}%
          </Typography>
          <Box>
            <Slider
              defaultValue={10}
              getAriaValueText={valuetext}
              aria-labelledby="percent"
              className="formField"
              step={1}
              min={0}
              max={100}
              name="resalePercentage"
              onChange={(event, value) => {
                setFieldValue("resalePercentage", value);
              }}
              disabled={disabled}
              {...field}
              {...form}
            />
          </Box>
          <Fade in={values.resalePercentage > 20}>
            <Warning variant="subtitle1" align="left">
              Are you certain about a {values.resalePercentage}% resale fee?
              High resale may discourage potential collectors.
            </Warning>
          </Fade>
        </Box>
      </Form>
    </Root>
  );
};
const PREFIX = "ReleaseCreateForm";

const classes = {
  fieldInputWrapper: `${PREFIX}-fieldInputWrapper`,
  formField: `${PREFIX}-formField`,
};

const Root = styled("div")(({ theme }) => ({
  margin: "auto",
  width: "300px",
  [`& .${classes.fieldInputWrapper}`]: {
    position: "relative",
  },
  [`& .${classes.formField}`]: {
    ...theme.helpers.baseFont,
    marginBottom: "8px",
    width: "100%",
    textTransform: "capitalize",
    position: "relative",
    "& input": {
      textAlign: "left",
      "&::placeholder": {
        color: theme.palette.red,
      },
    },
  },
}));

const Warning = styled(Typography)(({ theme }) => ({
  position: "absolute",
  textTransform: "none !important",
  color: theme.palette.red,
  opacity: "85%",
}));

export default withFormik({
  enableReinitialize: true,
  validationSchema: (props) => {
    return props.ReleaseCreateSchema;
  },
  mapPropsToValues: () => {
    return {
      artist: "",
      title: "",
      description: "",
      catalogNumber: "",
      amount: undefined,
      retailPrice: undefined,
      resalePercentage: 10,
    };
  },
})(ReleaseCreateForm);
