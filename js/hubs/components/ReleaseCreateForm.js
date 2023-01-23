import React, { useEffect, useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import { formatPlaceholder } from "@nina-protocol/nina-internal-sdk/esm/utils";
import { withFormik, Form, Field } from "formik";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import dynamic from "next/dynamic";
const QuillEditor = dynamic(() => import("./QuillEditor"), { ssr: false });

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
  const [isOpen, setIsOpen] = useState(false);
  const editionRef = useRef(isOpen);
  const [inputValue, setInputValue] = useState(undefined);
  useEffect(() => {
    if (onChange) {
      onChange(values);
    }
  }, [values]);

  useEffect(() => {
    if (isOpen) {
      const infin = "\u221e";
      setFieldValue("isOpen", true);
      setInputValue(infin);
      setFieldValue("amount", infin);
    }
    if (!isOpen) {
      setFieldValue("isOpen", false);
    }
  }, [isOpen]);

  const valuetext = (value) => {
    return `${value}%`;
  };

  const handleEditionChange = (event) => {
    editionRef.current = event.target.value;
    if (editionRef.current === "unlimited") {
      setIsOpen(true);
    }
    if (editionRef.current === "limited") {
      setIsOpen(false);
    }
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
        <Box
          className={classes.fieldInputWrapper}
          sx={{ display: "flex", alignItems: "left", textAlign: "center" }}
        >
          <FormControl sx={{ flexDirection: "row" }}>
            <FormLabel sx={{ marginTop: "10px" }}>EDITION TYPE</FormLabel>{" "}
            <RadioGroup
              row
              aria-labelledby="amount"
              defaultValue={editionRef.current}
            >
              <FormControlLabel
                value="limited"
                control={<FormRadio/>}
                label="Limited"
                onClick={(event) => handleEditionChange(event)}
                sx={{ marginLeft: "1px", marginRight: "5px" }}
                checked={!isOpen}
              />
              <FormControlLabel
                value="unlimited"
                control={<FormRadio/>}
                label="Unlimited"
                onClick={(event) => handleEditionChange(event)}
                checked={isOpen}
              />
            </RadioGroup>
          </FormControl>
        </Box>
        <Field name="amount">
          {({ field }) => (
            <Box className={classes.fieldInputWrapper} align={"left"}>
              <TextField
                className="formField"
                variant="standard"
                label={formatPlaceholder("Edition Size")}
                size="small"
                type={isOpen ? "text" : "number"}
                InputLabelProps={touched.amount ? { shrink: true } : ""}
                placeholder={
                  errors.amount && touched.amount ? errors.amount : null
                }
                InputProps={{
                  onChange: (event) => {
                    setInputValue(event.target.value);
                    if (!isOpen) {
                      let whole = parseInt(event.target.value);
                      setFieldValue("amount", whole);
                      setFieldValue("isOpen", false);
                    }
                    if (isOpen) {
                      setFieldValue("isOpen", true);
                      setFieldValue("amount", "Open");
                    }
                  },
                }}
                disabled={isOpen}
                {...field}
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

          <Field name="description">
            {(props) => (
              <Box sx={{ borderBottom: "1px solid grey", height: "14vh" }}>
                <QuillEditor
                  formikProps={props}
                  type={"release"}
                  update={false}
                />
              </Box>
            )}
          </Field>

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

const FormRadio = (props) => {
  return (
    <Radio
      disableRipple
      sx={{
        "&&:hover": {
          backgroundColor: "transparent",
        },
      }}
      {...props}
    />
  );
}

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
    // textTransform: "capitalize",
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
  top: "-5%",
  left: "122%",
  width: "220px",
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
      amount: "10",
      retailPrice: undefined,
      resalePercentage: 10,
      isOpen: false,
    };
  },
})(ReleaseCreateForm);
