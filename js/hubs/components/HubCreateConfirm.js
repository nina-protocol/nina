import {useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { styled } from "@mui/material/styles";
import { useWallet } from "@solana/wallet-adapter-react";

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
              Handle: <span style={{paddingLeft: '15px'}}>{formValues.hubForm.handle}</span>
            </Value>

            <Typography sx={{mt: 1}} variant="subtitle1">note: all values other than Handle can be updated at anytime.</Typography>

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
  // justifyContent: "space-between",
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
