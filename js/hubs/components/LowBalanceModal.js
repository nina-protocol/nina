import React, { useState, useEffect, useContext, useMemo } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Nina from "@nina-protocol/nina-internal-sdk/esm/Nina";
import Release from "@nina-protocol/nina-internal-sdk/esm/Release";
import { useSnackbar } from "notistack";
import { useWallet } from "@solana/wallet-adapter-react";

import Dots from "./Dots";

const LowBalanceModal = () => {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const wallet = useWallet();
  const {
    solPrice,
    getSolPrice,
    lowSolBalance,
    usdcBalance,
    getUserBalances,
    ninaClient,
    getUsdcToSolSwapData,
    swapUsdcToSol,
  } = useContext(Nina.Context);
  const { getUserCollectionAndPublished, releaseState } = useContext(
    Release.Context
  );
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);
  const [amount, setAmount] = useState();
  const [inProgress, setInProgress] = useState(false);
  const [routes, setRoutes] = useState();
  const [buttonText, setButtonText] = useState("Enter Swap Amount");
  const [userPublishedReleases, setUserPublishedReleases] = useState();
  const [collectableBalance, setCollectableBalance] = useState(0);
  const { ids, nativeToUi } = ninaClient;

  useEffect(() => {
    const getUserData = async () => {
      await getUserBalances();
      if (lowSolBalance) {
        const [_, published] = await getUserCollectionAndPublished(
          wallet.publicKey.toBase58(),
          true
        );
        setUserPublishedReleases(published);
      }
    };
    if (wallet.connected) {
      getUserData();
    }
  }, [lowSolBalance]);

  useEffect(() => {
    if (lowSolBalance && (usdcBalance > 0 || collectableBalance > 0)) {
      setShowBalanceWarning(true);
    }
  }, [lowSolBalance, usdcBalance]);

  useEffect(() => {
    if (userPublishedReleases) {
      let total = 0;
      userPublishedReleases?.forEach((release) => {
        const recipient =
          release.accountData.release.revenueShareRecipients.find(
            (recipient) =>
              recipient.recipientAuthority === wallet.publicKey.toBase58()
          );
        total = total + recipient.owed;
        return recipient.owed;
      });
      setCollectableBalance(nativeToUi(total, ids.mints.usdc).toFixed(2));
    }
  }, [userPublishedReleases]);

  useEffect(() => {
    const getSwapData = async () => {
      const data = await getUsdcToSolSwapData(amount);
      setRoutes(data.data);
      return data;
    };

    if (amount > 0) {
      getSwapData();
    }
  }, [amount]);

  //MOVE TO NINA CONTEXT
  useEffect(() => {
    if (routes) {
      const outAmount = routes[0].outAmount / 1000000000;
      if (amount > usdcBalance * 1) {
        setButtonText("Insufficient balance");
      } else {
        setButtonText(`Swap ${amount} USDC for ${outAmount} SOL`);
      }
    }
  }, [routes]);

  const handleSwap = async () => {
    setInProgress(true);
    const result = await swapUsdcToSol(routes);
    if (result?.success) {
      enqueueSnackbar(result.msg, {
        variant: "info",
      });
      await getUserBalances()
      setOpen(false);
    } else {
      enqueueSnackbar("Swap Unsuccesful", {
        variant: "failure",
      });
    }
    setAmount();
    setInProgress(false);
  };

  return (
    <>
      {showBalanceWarning && (
        <Root>
          <StyledModalToggle
            align={"right"}
            variant="body1"
            textTransform={"none"}
            onClick={() => setOpen(true)}
          >
            Low Balance
          </StyledModalToggle>

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
                  Convert USDC to SOL
                </Typography>
                <Typography align="left" variant="body1" gutterBottom>
                  Your Solana balance is below 0.01 which may cause transactions
                  to fail.
                </Typography>
                {usdcBalance && (
                  <Typography align="left" variant="body1" gutterBottom>
                    Your wallet has a balance of ${usdcBalance} USDC. You can
                    use the swap below to convert some USDC to Sol.
                  </Typography>
                )}
                {collectableBalance > 0 && (
                  <Typography align="left" variant="body1" gutterBottom>
                    You have a collectable balance of ${collectableBalance} USDC
                    that can be collected through your{" "}
                    <a
                      target="__blank"
                      rel="noreferrer"
                      href={`https://www.ninaprotocol.com/profiles/${wallet.publicKey.toBase58()}`}
                    >
                      dashboard
                    </a>
                    .
                  </Typography>
                )}

                <StyledInputWrapper>
                  <StyledTextField
                    variant="standard"
                    value={amount}
                    type="number"
                    max
                    onChange={(e) => {
                      if (e.target.value >= 0) {
                        setAmount(e.target.value);
                      }
                    }}
                    label={`Swap Amount (USDC to SOL):`}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">USDC</InputAdornment>
                      ),
                    }}
                    inputProps={{
                      min: 0,
                      max: 10,
                    }}
                  />
                </StyledInputWrapper>
                <Button
                  onClick={() => handleSwap(amount)}
                  variant="outlined"
                  sx={{
                    width: "100%",
                    mt: 1,
                  }}
                  disabled={!amount || inProgress || amount > usdcBalance * 1}
                >
                  {inProgress ? <Dots size={"60px"} /> : buttonText}
                </Button>
              </StyledPaper>
            </Fade>
          </StyledModal>
        </Root>
      )}
    </>
  );
};

const Root = styled("div")(({ theme }) => ({
  display: "flex",
}));

const StyledModalToggle = styled(Typography)(({ theme }) => ({
  color: theme.palette.red,
  outline: `1px solid ${theme.palette.red}`,
  padding: "2px 4px",
  marginRight: "15px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
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

const StyledTextField = styled(TextField)(() => ({
  "& input": {
    textAlign: "right",
    paddingRight: "5px",
  },
}));

const StyledInputWrapper = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
}));

export default LowBalanceModal;
