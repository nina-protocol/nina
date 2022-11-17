import React, { useState, useEffect, useContext, useMemo } from "react";
import Hub from "@nina-protocol/nina-internal-sdk/esm/Hub";
import Nina from "@nina-protocol/nina-internal-sdk/esm/Nina";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import HubPostCreate from "./HubPostCreate";

import { useSnackbar } from "notistack";
import Dots from "./Dots";

const AddToHubModal = ({ userHubs, releasePubkey, metadata, hubPubkey }) => {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { checkIfHasBalanceToCompleteAction, NinaProgramAction } = useContext(
    Nina.Context
  );
  const { hubAddRelease } = useContext(Hub.Context);
  const [selectedHubId, setSelectedHubId] = useState();
  const [inProgress, setInProgress] = useState(false);
  const [canAddContent, setCanAddContent] = useState(false);
  const userHasHubs = useMemo(
    () => userHubs && userHubs.length > 0,
    [userHubs]
  );

  useEffect(() => {
    if (userHubs?.length === 1) {
      setSelectedHubId(userHubs[0]?.id);
    }
  }, [userHubs]);

  useEffect(() => {
    if (selectedHubId && userHubs) {
      const selectedHub = userHubs.find(
        (hub) => hub.publicKey === selectedHubId
      );
      if (selectedHub?.userCanAddContent) {
        setCanAddContent(true);
      }
    }
  }, [selectedHubId, userHubs]);

  const handleRepost = async (e) => {
    const error = await checkIfHasBalanceToCompleteAction(
      NinaProgramAction.HUB_ADD_RELEASE
    );
    if (error) {
      enqueueSnackbar(error.msg, { variant: "failure" });
      return;
    }

    setInProgress(true);
    enqueueSnackbar("Adding Release to Hub", {
      variant: "info",
    });

    handleClose();
    const result = await hubAddRelease(selectedHubId, releasePubkey, hubPubkey);
    if (result?.success) {
      enqueueSnackbar(result.msg, {
        variant: "info",
      });
    } else {
      enqueueSnackbar("Release not added to hub", {
        variant: "failure",
      });
    }
    setInProgress(false);
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedHubId(null);
  };

  return (
    <Root>
      <ModalToggle
        variant="contained"
        color="primary"
        type="submit"
        onClick={() => setOpen(true)}
        sx={{ height: "22px", width: "28px", m: 0 }}
      >
        <AutorenewIcon />
      </ModalToggle>

      <StyledModal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={() => handleClose()}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <StyledPaper>
            {!userHasHubs && (
              <>
                <Typography gutterBottom color="black">
                  The connected wallet is not a collaborator on any hub.
                </Typography>
                <Typography>
                  <a
                    href="https://docs.google.com/forms/d/1JOgbVh-5SbA4mCwSWAiSolPCAHCjx6baSiJGh0J7N1g"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "black" }}
                  >
                    Click here to get started setting up your hub.
                  </a>
                </Typography>
              </>
            )}
            {userHasHubs && (
              <>
                <Typography
                  align="center"
                  variant="h4"
                  id="transition-modal-title"
                  gutterBottom
                  color={"black"}
                >
                  Add {metadata.name} to{" "}
                  {userHubs.length > 1
                    ? "one of your hubs"
                    : "your hub: " + userHubs[0]?.data?.displayName}
                </Typography>

                {userHubs.length > 1 && (
                  <FormControl sx={{ mt: 1 }}>
                    <InputLabel disabled>Select a hub to add to</InputLabel>

                    <Select
                      className="formField"
                      placeholder="Release Reference"
                      displayEmpty
                      label="Select hub"
                      fullWidth
                      variant="standard"
                      onChange={(e, userHubs) => {
                        setSelectedHubId(e.target.value);
                      }}
                    >
                      {userHubs
                        ?.filter(
                          (hub) =>
                            hub.publicKey &&
                            hub.publicKey !== hubPubkey &&
                            hub.userCanAddContent
                        )
                        .map((hub) => {
                          return (
                            <MenuItem
                              key={hub?.publicKey}
                              value={hub?.publicKey}
                              sx={{ color: "black" }}
                            >
                              {hub?.data?.displayName}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </FormControl>
                )}
              </>
            )}
            <Button
              style={{ marginTop: "15px", textTransform: "uppercase" }}
              variant="outlined"
              disabled={
                inProgress || !selectedHubId || !userHasHubs || !canAddContent
              }
              onClick={handleRepost}
            >
              {!inProgress && "Repost release to your hub"}
              {inProgress && (
                <Dots msg={"Please approve transaction in wallet"} />
              )}
            </Button>

            <HubPostCreate
              userHubs={userHubs}
              preloadedRelease={releasePubkey}
              hubPubkey={hubPubkey}
              selectedHubId={selectedHubId}
              setParentOpen={handleClose}
              userHasHubs={userHasHubs}
              canAddContent={canAddContent}
              update={false}
            />
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  );
};

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
}));

const ModalToggle = styled(Button)(({ theme }) => ({
  color: `${theme.palette.text.primary} !important`,
  ":disabled": {
    color: theme.palette.text.primary + "a0",
  },
  "&:hover": {
    opacity: "50%",
    backgroundColor: `${theme.palette.transparent} !important`,
  },
}));

const StyledModal = styled(Modal)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: "2px solid #000",
  boxShadow: theme.shadows[5],
  // padding: theme.spacing(2, 4, 3),
  padding: `30px 60px 45px`,
  width: "40vw",
  maxHeight: "90vh",
  overflowY: "auto",
  zIndex: "10",
  display: "flex",
  flexDirection: "column",
  minWidth: "600px",
}));

export default AddToHubModal;
