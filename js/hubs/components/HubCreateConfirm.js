import {useState, useMemo, useEffect, createElement, Fragment } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { styled } from "@mui/material/styles";
import { useWallet } from "@solana/wallet-adapter-react";

import {unified} from "unified";
import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import rehypeExternalLinks from "rehype-external-links";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const HubCreateConfirm = (props) => {
  const {
    formIsValid,
    formValues,
    handleSubmit,
    setFormValuesConfirmed,
    hubData,
    update,
    backgroundColor,
    textColor,
  } = props;

  const wallet = useWallet();
  const isAuthority = useMemo(
    () =>
      wallet?.publicKey && wallet?.publicKey?.toBase58() === hubData?.authority,
    [hubData, wallet]
  );
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [buttonText, setButtonText] = useState("Create Hub");
  const [description, setDescription] = useState();

  const submitAndCloseModal = async () => {
    setFormValuesConfirmed(true);
    await handleSubmit();
    setOpen(false);
  };

  useEffect(() => {
    if (update && isAuthority) {
      setButtonText("Update Hub Info");
    } else if (update && !isAuthority) {
      setButtonText("You do not have permission to update Hub Info");
    }
  }, [update, isAuthority]);

  useEffect(() => {
    if (formValues.hubForm.description) {
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
        JSON.parse(formValues.hubForm.description).replaceAll(
          "<p><br></p>",
          ""
        )
      )
      .then((file) => {
        setDescription(file.result);
      });
    }
  }, [formValues.hubForm.description]);

  return (
    <div>
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        onClick={handleOpen}
        disabled={!formIsValid || (update && !isAuthority)}
        sx={{ height: "54px" }}
      >
        {/* {update ? 'Update Hub Info' : 'Create Hub'} */}
        {buttonText}
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant="h4">
            Please double check the following information before{" "}
            {update ? "updating" : "creating"} your hub
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Value sx={{ mt: 1 }}>
              Display Name: <span>{formValues.hubForm.displayName}</span>
            </Value>

            <Value sx={{ mt: 1 }}>
              Publish Fee:<span>{formValues.hubForm.publishFee}%</span>
            </Value>

            <Value sx={{ mt: 1 }}>
              Referral Fee:<span>{formValues.hubForm.referralFee}%</span>
            </Value>

            <Value className="description" sx={{ mt: 1 }}>
              Description: <span>{formValues.hubForm.description}</span>
            </Value>

            <Value sx={{ mt: 1 }}>
              External Url: <span>{formValues.hubForm.externalUrl}</span>
            </Value>

            {backgroundColor && (
              <Typography
                style={{
                  borderLeft: `15px solid ${backgroundColor}`,
                  paddingLeft: "10px",
                }}
              >
                BackgroundColor: {backgroundColor}
              </Typography>
            )}
            {textColor && (
              <Typography
                style={{
                  borderLeft: `15px solid ${textColor}`,
                  paddingLeft: "10px",
                }}
              >
                TextColor: {textColor}
              </Typography>
            )}

            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={submitAndCloseModal}
              disabled={update && !isAuthority}
              sx={{ marginTop: "15px !important", height: "54px" }}
            >
              {update ? "Update Hub Info" : "Confirm and Create Hub"}
            </Button>

            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={handleClose}
              sx={{ marginTop: "15px !important", height: "54px" }}
            >
              Close and Edit
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

const Value = styled(Typography)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  "& span": {
    textAlign: "right",
  },

  "&.description": {
    "& span": {
      paddingLeft: theme.spacing(1),
      textAlign: "left",
      maxHeight: "150px",
      overflowY: "scroll",
    },
  },
}));

export default HubCreateConfirm;
