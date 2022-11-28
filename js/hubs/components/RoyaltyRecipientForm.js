import React, { useContext } from "react";
import { styled } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import { Formik, Field, Form } from "formik";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

import { formatPlaceholder } from "@nina-protocol/nina-internal-sdk/esm/utils";
import Release from "@nina-protocol/nina-internal-sdk/esm/Release";

const RoyaltyRecipientForm = (props) => {
  const { release, userShare, setUserDisplayShare, releasePubkey, toggleForm } =
    props;
  const { enqueueSnackbar } = useSnackbar();
  const { addRoyaltyRecipient } = useContext(Release.Context);

  const handleDisplayPercent = (value) => {
    const sending = parseInt(value);
    setUserDisplayShare(userShare - sending);
  };

  const valuetext = (value) => {
    return `${value}%`;
  };

  const marks = [
    {
      value: 0,
      label: "0%",
    },
    {
      value: userShare,
      label: `${userShare}%`,
    },
  ];

  return (
    <Root>
      <Formik
        initialValues={{
          recipientAddress: "",
          percentShare: 20,
        }}
        onSubmit={async (values, { resetForm, initialValues }) => {
          let result;
          enqueueSnackbar("Transferring Royalty...", {
            variant: "info",
          });
          result = await addRoyaltyRecipient(release, values, releasePubkey);
          enqueueSnackbar(result.msg, {
            variant: result.success ? "success" : "warn",
          });
          resetForm(initialValues);
          toggleForm();
        }}
      >
        {({ values, setFieldValue, field, form }) => (
          <Box mt={3} className="royalty__form-wrapper">
            <Typography variant="h6">
              Transferring {values.percentShare}% to:
            </Typography>
            <Form className="royalty__form">
              <Field name="recipientAddress">
                {({ field }) => (
                  <>
                    <StyledTextField
                      className={classes.formField}
                      placeholder={formatPlaceholder(field.name)}
                      label={formatPlaceholder(field.name)}
                      {...field}
                    />
                  </>
                )}
              </Field>

              <Typography id="discrete-slider-custom" align="left">
                Percent Share:
              </Typography>
              <Box className={classes.royaltyPercentageWrapper}>
                <StyledSlider
                  defaultValue={20}
                  getAriaValueText={valuetext}
                  aria-labelledby="percent"
                  valueLabelDisplay="auto"
                  className={`${classes.formField} ${classes.formSlider}`}
                  step={1}
                  min={0}
                  max={userShare}
                  name="resalePercentage"
                  marks={marks}
                  onChange={(event, value) => {
                    handleDisplayPercent(value);
                    setFieldValue("percentShare", value);
                  }}
                  {...field}
                  {...form}
                />
              </Box>

              <Box mt={3}>
                <TransferRoyaltyButton type="submit" fullWidth>
                  Transfer Royalty
                </TransferRoyaltyButton>
              </Box>
            </Form>
          </Box>
        )}
      </Formik>
    </Root>
  );
};

const PREFIX = "RoyaltyRecipientForm";

const classes = {
  redeemableForm: `${PREFIX}-redeemableForm`,
  formField: `${PREFIX}-formField`,
  formSelect: `${PREFIX}-formSelect`,
  formInputGroup: `${PREFIX}-formInputGroup`,
  royaltyPercentageWrapper: `${PREFIX}-royaltyPercentageWrapper`,
  formError: `${PREFIX}-formError`,
};

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: `${theme.palette.text.primary} !important`,
  "& .MuiSlider-thumb": {
    backgroundColor: `${theme.palette.text.primary} !important`,
  },
  "& .MuiSlider-rail": {
    color: `${theme.palette.text.primary} !important`,
    backgroundColor: `${theme.palette.text.primary} !important`,
  },
  "& .MuiSlider-track": {
    color: `${theme.palette.text.primary} !important`,
    backgroundColor: `${theme.palette.text.primary} !important`,
  },
  "& .MuiSlider-markLabel": {
    color: `${theme.palette.text.primary} !important`,
  },
}));
const StyledTextField = styled(TextField)(({ theme }) => ({
  color: `${theme.palette.text.primary} !important`,
  outline: "none",
  borderColor: `${theme.palette.text.primary} !important`,
  "& .MuiInputLabel-root": {
    color: `${theme.palette.text.primary} !important`,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: `${theme.palette.text.primary} !important`,
  },
}));
const TransferRoyaltyButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  borderRadius: "0px",
  border: `1px solid ${theme.palette.text.primary}`,
}));
const Root = styled("div")(({ theme }) => ({
  color: theme.palette.text.primary,
  [`& .${classes.redeemableForm}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 1rem",

    overflowY: "auto",
  },

  [`& .${classes.formField}`]: {
    margin: "0.75rem 0em",
    width: "100%",
    color: theme.palette.text.primary,
    stroke: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
    textTransform: "capitalize",
    "& :placeholder": {
      textTransform: "capitalize",
    },
  },

  [`& .${classes.formSelect}`]: {
    padding: "18.5px 14px",
    boxSizing: "border-box",
    color: theme.palette.text.primary,
    borderColor: "rgba(0, 0, 0, 0.23)",
    color: "rgba(0, 0, 0, 0.5)",
    "& $option": {
      color: "red",
    },
  },

  [`& .${classes.formInputGroup}`]: {
    display: "flex",
    width: "100%",
    "& > :first-child": {
      marginLeft: "0",
    },
    "& > :last-child": {
      marginRight: "0",
    },
  },

  [`& .${classes.royaltyPercentageWrapper}`]: {
    display: "flex",
    justifyContent: "space-inbetween",
    alignItems: "center",
    color: `${theme.palette.text.primary} !important`,
  },

  [`& .${classes.formError}`]: {
    color: `${theme.palette.red}`,
  },
}));

export default RoyaltyRecipientForm;
