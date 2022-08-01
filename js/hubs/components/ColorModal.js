import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { HexColorPicker } from "react-colorful";


const ColorModal = ({
  backgroundColor,
  setBackgroundColor,
  textColor,
  setTextColor,
  colorReset,
}) => {
  const [open, setOpen] = useState(false);

  const handleCancel = () => {
    colorReset();
    setOpen(false);
  };

  return (
    <Root>
      <Button
        variant="contained"
        color="primary"
        type="submit"
        onClick={() => setOpen(true)}
        mt={2}
        mb={2}
      >
        <Typography
          align="left"
          textTransform={"none"}
          style={{ textDecoration: "underline" }}
        >
          Customize Appearance
        </Typography>
      </Button>

      <StyledModal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <StyledPaper>
            <Box
              display="flex"
              justifyContent={"space-between"}
              mb={3}
              width="100%"
            >
              <Box>
                <Typography mb={1}>Select a background color:</Typography>

                <HexColorPicker
                  color={backgroundColor ? backgroundColor : "#ffffff"}
                  onChange={setBackgroundColor}
                  style={{ paddingBottom: "15px" }}
                />

                <Typography
                  mt={1}
                  style={{
                    borderLeft: `15px solid ${backgroundColor}`,
                    paddingLeft: "10px",
                  }}
                >
                  Background:{" "}
                  {backgroundColor ? backgroundColor : "default (white)"}
                </Typography>
              </Box>

              <Box>
                <Typography mb={1}>Select a text color:</Typography>

                <HexColorPicker
                  color={textColor ? textColor : "#000000"}
                  onChange={setTextColor}
                />

                <Typography
                  mt={1}
                  style={{
                    borderLeft: `15px solid ${
                      textColor ? textColor : "#000000"
                    }`,
                    paddingLeft: "10px",
                  }}
                >
                  Text : {textColor ? textColor : "default (black)"}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="outlined"
              color="primary"
              type="submit"
              onClick={() => setOpen(false)}
              fullWidth
            >
              <Typography align="center" textTransform={"none"}>
                Select
              </Typography>
            </Button>

            <Button
              variant="outlined"
              color="primary"
              type="submit"
              onClick={handleCancel}
              sx={{
                marginTop: "15px",
              }}
              fullWidth
            >
              <Typography align="center" textTransform={"none"}>
                Cancel
              </Typography>
            </Button>
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

const StyledModal = styled(Modal)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: "1px solid #000",
  padding: theme.spacing(8, 8, 8),
  width: "40vw",
  maxHeight: "90vh",
  overflowY: "auto",
  zIndex: "10",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
}));

export default ColorModal;
