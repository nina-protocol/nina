import React, { useState, useEffect, useContext, useMemo } from "react";
import { styled } from "@mui/material/styles";
import { Box, Paper } from "@mui/material";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import nina from "@nina-protocol/nina-sdk";
import { useSnackbar } from "notistack";
import Dots from "./Dots";

const { NinaContext } = nina.contexts;

const BundlrModal = ({ inCreate }) => {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const {
    bundlrBalance,
    getBundlrBalance,
    bundlrFund,
    bundlrWithdraw,
    getBundlrPricePerMb,
    bundlrPricePerMb,
    solPrice,
    getSolPrice,
    initBundlr,
    ninaClient,
    bundlr,
  } = useContext(NinaContext);
  const [amount, setAmount] = useState();
  const mbs = useMemo(
    () => bundlrBalance / bundlrPricePerMb,
    [bundlrBalance, bundlrPricePerMb]
  );
  const bundlrUsdBalance = useMemo(
    () => bundlrBalance * solPrice,
    [bundlrBalance, solPrice]
  );
  const [mode, setMode] = useState("deposit");
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    initBundlr();
  }, []);

  useEffect(() => {
    if (bundlr) {
      getBundlrPricePerMb();
      getBundlrBalance();
      getSolPrice();
    }
  }, [bundlr]);

  const handleFund = async (fundAmount) => {
    setInProgress(true);
    const result = await bundlrFund(fundAmount);
    if (result?.success) {
      enqueueSnackbar(result.msg, {
        variant: "info",
      });
      setOpen(false);
    } else {
      enqueueSnackbar("Account not funded", {
        variant: "failure",
      });
    }
    setAmount("");
    setInProgress(false);
  };

  const handleWithdraw = async (withdrawAmount) => {
    setInProgress(true);
    const result = await bundlrWithdraw(withdrawAmount);
    if (result?.success) {
      enqueueSnackbar(result.msg, {
        variant: "info",
      });
      setOpen(false);
    } else {
      enqueueSnackbar("Withdrawl not completed", {
        variant: "failure",
      });
    }
    setAmount("");
    setInProgress(false);
  };

  const handleToggleMode = () => {
    setMode(mode === "deposit" ? "withdraw" : "deposit");
  };

  return (
    <Root>
      {!inCreate && (
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={() => setOpen(true)}
        >
          <Typography align="left" textTransform={"none"}>
            Manage Upload Account
          </Typography>
        </Button>
      )}
      {inCreate && (
        <Button
          variant="outlined"
          color="primary"
          type="submit"
          fullWidth
          onClick={() => setOpen(true)}
          sx={{ height: "54px" }}
        >
          <Typography align="left" textTransform={"none"}>
            Click here to fund your Upload Account and start publishing
          </Typography>
        </Button>
      )}
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
            <Typography
              align="center"
              variant="h4"
              id="transition-modal-title"
              gutterBottom
            >
              Fund your Upload Account
            </Typography>
            <Typography align="left" variant="subtitle1">
              Here you can deposit SOL to your upload account to cover the
              storage costs of your Nina releases.
            </Typography>

            <Typography align="left" variant="subtitle1" gutterBottom>
              A one time fee for each release uploads the files to a permanent
              location on Arweave via Bundlr.
            </Typography>
            <Typography gutterBottom>
              Upload Account Balance: {bundlrBalance?.toFixed(4)} SOL ($
              {bundlrUsdBalance.toFixed(2)})
            </Typography>
            <Typography>
              Available Storage: {mbs?.toFixed(2)} MBs{" "}
              {bundlrBalance > 0 && mbs > 0
                ? `($${(bundlrUsdBalance / mbs)?.toFixed(4)} /MB)`
                : ""}
            </Typography>
            {bundlrBalance > 0 && (
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={handleToggleMode}
                fullWidth={true}
                size="small"
                sx={{ margin: "15px 0" }}
              >
                <ToggleButton value="deposit">Deposit</ToggleButton>
                <ToggleButton value="withdraw">Withdraw</ToggleButton>
              </ToggleButtonGroup>
            )}
            <InputWrapper>
              <TextField
                fullWidth
                id={mode === "deposit" ? "fund" : "withdraw"}
                name={mode === "deposit" ? "fund" : "withdraw"}
                label={
                  `${mode === "deposit" ? "Deposit" : "Withdraw"}` +
                  " Amount (SOL):"
                }
                onChange={(e) => setAmount(e.target.value)}
                value={amount}
                type="number"
                variant="standard"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">
<<<<<<< HEAD
                      {amount > 0 ? `(${amount / bundlrPricePerMb} MBs)` : ""}
=======
                      {amount > 0
                        ? `(${(amount / bundlrPricePerMb).toFixed(2)} MBs)`
                        : ""}
>>>>>>> b703f577b7a2e5098f1f66f23a642b8da4241c95
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                style={{ marginTop: "15px" }}
                color="primary"
                variant="outlined"
                onClick={() => {
                  mode === "deposit"
                    ? handleFund(amount)
                    : handleWithdraw(amount);
                }}
                disabled={inProgress || !amount}
              >
                {!inProgress && (mode === "deposit" ? "Deposit" : "Withdraw")}
                {inProgress && (
<<<<<<< HEAD
                  <Dots msg={"Please aprrove transaction in wallet"} />
=======
                  <Dots msg={"Please approve transaction in wallet"} />
>>>>>>> b703f577b7a2e5098f1f66f23a642b8da4241c95
                )}
              </Button>
            </InputWrapper>
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  );
};

const PREFIX = "Royalty";

const classes = {
  recipientData: `${PREFIX}-recipientData`,
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
  border: "2px solid #000",
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  width: "40vw",
  maxHeight: "90vh",
  overflowY: "auto",
  zIndex: "10",
}));

const InputWrapper = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
}));

export default BundlrModal;
