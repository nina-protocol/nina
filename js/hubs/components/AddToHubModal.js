import React, { useState, useEffect, useContext, useMemo } from "react";
import nina from "@nina-protocol/nina-sdk";
import { styled } from "@mui/material/styles";
import { Box, Paper } from "@mui/material";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { FormControl, InputLabel } from "@mui/material";
import HubPostCreate from "./HubPostCreate";
import Link from "next/link";

import { useSnackbar } from "notistack";
import Dots from "./Dots";

const { HubContext } = nina.contexts;

const AddToHubModal = ({ userHubs, releasePubkey, metadata, hubPubkey }) => {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { hubAddRelease } = useContext(HubContext);
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
      const selectedHub = userHubs.find((hub) => hub.id === selectedHubId);
      if (selectedHub.userCanAddContent) {
        setCanAddContent(true);
      }
    }
  }, [selectedHubId, userHubs]);

  const handleRepost = async (e) => {
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
                    : "your hub: " + userHubs[0]?.json?.displayName}
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
                          (hub) => hub.id !== hubPubkey && hub.userCanAddContent
                        )
                        .map((hub) => {
                          return (
                            <MenuItem
                              key={hub?.id}
                              value={hub?.id}
                              sx={{ color: "black" }}
                            >
                              {hub?.json?.displayName}
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
<<<<<<< HEAD
                <Dots msg={"Please approve transaction in wallet"} />
=======
                <Dots msg={"Please aprrove transaction in wallet"} />
>>>>>>> fd4bebc686d1a12e3480b9f1a5f9f3ab39feb432
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
