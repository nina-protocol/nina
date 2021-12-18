import React, { useState, useRef, useEffect, useContext } from "react";
import { styled } from "@mui/material/styles";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useSnackbar } from "notistack";
import { useWallet } from "@solana/wallet-adapter-react";
import ninaCommon from "nina-common";

const { NinaContext } = ninaCommon.contexts;
const { NinaClient } = ninaCommon.utils;
const { NINA_API_ENDPOINT } = NinaClient.endpoints.api;
const appId = "sandbox-sq0idb-DMY7d2nTvA4ieoFgrey2_w";
const locationId = "L7AWX5H2HF9AV";
const TRANSACTION_COST_SOL = 0.00204428;

const SquareForm = (props) => {
  const {
    handleClose,
    squareLoaded,
    releasePubkey,
    release,
    updateStateAfterSquarePurchase,
  } = props;

  const wallet = useWallet();
  const { enqueueSnackbar } = useSnackbar();
  const { getSolPrice, solPrice } = useContext(NinaContext);

  const [squareFee, setSquareFee] = useState(0);
  const [vaultFee, setVaultFee] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [squareFormInitialized, setSquareFormInitiazlized] = useState(false);
  const [pending, setPending] = useState(false);

  const cardButtonRef = useRef();
  const paymentStatusRef = useRef();

  useEffect(() => {
    getSolPrice();
  }, []);

  useEffect(() => {
    setVaultFee(
      Math.ceil(solPrice * 1000000 * TRANSACTION_COST_SOL * 1000) / 1000
    );
  }, [solPrice]);

  useEffect(() => {
    const releasePrice = release.price.toNumber();
    let fee = releasePrice * 0.029 + 300000;
    fee += Math.ceil((squareFee + releasePrice) * 0.029 * 1000) / 1000;
    setSquareFee(fee);
  }, [release]);

  useEffect(() => {
    if (squareFee && vaultFee) {
      setTotalCost(
        Math.ceil((release.price.toNumber() + squareFee + vaultFee) * 1000) /
          1000
      );
    }
  }, [squareFee, vaultFee]);

  useEffect(() => {
    if (squareLoaded && !squareFormInitialized) {
      squareInit();
      setSquareFormInitiazlized(true);
    }
  }, [squareLoaded]);

  const initializeCard = async (payments) => {
    const card = await payments.card();
    await card.attach("#card-container");
    return card;
  };

  const createPayment = async (token) => {
    setPending(true);
    const body = JSON.stringify({
      locationId,
      sourceId: token,
      customerId: `${wallet.publicKey.toBase58()}`,
      note: `${releasePubkey}`,
    });

    const paymentResponse = await fetch(
      `${NINA_API_ENDPOINT}/api/square/payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      }
    );

    if (paymentResponse.ok) {
      return paymentResponse.json();
    }
    const errorBody = await paymentResponse.text();
    throw new Error(errorBody);
  };

  async function tokenize(paymentMethod) {
    const tokenResult = await paymentMethod.tokenize();
    if (tokenResult.status === "OK") {
      return tokenResult.token;
    } else {
      let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
      if (tokenResult.errors) {
        errorMessage += ` and errors: ${JSON.stringify(tokenResult.errors)}`;
      }

      throw new Error(errorMessage);
    }
  }

  function displayPaymentResults(success) {
    setPending(false);
    const statusContainer = paymentStatusRef.current;
    if (success) {
      enqueueSnackbar("Payment Success", {
        variant: "success",
      });
      statusContainer.classList.remove("is-failure");
      statusContainer.classList.add("is-success");
      updateStateAfterSquarePurchase(releasePubkey);
    } else {
      enqueueSnackbar("Payment Failed", {
        variant: "error",
      });
      statusContainer.classList.remove("is-success");
      statusContainer.classList.add("is-failure");
    }

    statusContainer.style.visibility = "visible";
  }

  const squareInit = async () => {
    if (squareLoaded) {
      let payments;
      try {
        payments = window.Square.payments(appId, locationId);
      } catch {
        const statusContainer = paymentStatusRef.current;
        statusContainer.className = "missing-credentials";
        statusContainer.style.visibility = "visible";
        return;
      }

      let card;
      try {
        card = await initializeCard(payments);
      } catch (e) {
        console.error("Initializing Card failed", e);
        return;
      }

      // Checkpoint 2.
      const cardButton = cardButtonRef.current;
      cardButton.addEventListener("click", async function (event) {
        await handlePaymentMethodSubmission(event, card);
      });
    }
  };

  const handlePaymentMethodSubmission = async (event, paymentMethod) => {
    event.preventDefault();
    try {
      // disable the submit button as we await tokenization and make a payment request.
      cardButtonRef.current.disabled = true;
      const token = await tokenize(paymentMethod);
      await createPayment(token);
      displayPaymentResults(true);
      handleClose();
    } catch (e) {
      cardButtonRef.current.disabled = false;
      displayPaymentResults(false);
      console.error(e.message);
    }
  };

  return (
    <Root className={classes.squareForm}>
      <form id="payment-form" className={classes.squarePaymentForm}>
        <div id="card-container"></div>
        <Button
          ref={cardButtonRef}
          type="submit"
          variant="contained"
          color="primary"
          id="card-button"
          className={classes.squarePaymentButton}
        >
          {pending ? (
            <CircularProgress className="default__loader" color="inherit" />
          ) : (
            `Pay ${NinaClient.nativeToUiString(totalCost, release.paymentMint)}`
          )}
        </Button>
      </form>
      <div ref={paymentStatusRef} id="payment-status-container"></div>

      <div>
        <Typography variant="body1">
          Release:{" "}
          {NinaClient.nativeToUiString(
            release.price.toNumber(),
            release.paymentMint
          )}
        </Typography>
        <Typography variant="body1">
          Processor Fee:{" "}
          {NinaClient.nativeToUiString(squareFee, release.paymentMint)}
        </Typography>
        <Typography variant="body1">
          Transaction Fee:{" "}
          {NinaClient.nativeToUiString(vaultFee, release.paymentMint)}
        </Typography>
        <Typography variant="body1">
          Total: {NinaClient.nativeToUiString(totalCost, release.paymentMint)}
        </Typography>
      </div>
    </Root>
  );
};

const PREFIX = "SquareForm";

const classes = {
  squareForm: `${PREFIX}-squareForm`,
  squarePaymentForm: `${PREFIX}-squarePaymentForm`,
  squarePaymentButton: `${PREFIX}-squarePaymentButton`,
};

const Root = styled("div")(() => ({
  [`&.${classes.squareForm}`]: {},

  [`& .${classes.squarePaymentForm}`]: {
    display: "flex",
    flexDirection: "column",
  },

  [`& .${classes.squarePaymentButton}`]: {
    margin: "auto",
  },
}));

export default SquareForm;
