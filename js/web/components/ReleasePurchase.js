import React, { useEffect, useState, useContext } from "react";
import { styled } from "@mui/material/styles";
import ninaCommon from "nina-common";
import { useWallet } from "@solana/wallet-adapter-react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useSnackbar } from "notistack";
import { Typography } from "@mui/material";
import Link from "next/link";

const { Dots, ReleaseSettings } = ninaCommon.components;
const { ReleaseContext, NinaContext, ExchangeContext } = ninaCommon.contexts;
const { NinaClient } = ninaCommon.utils;

const ReleasePurchase = (props) => {
  const { releasePubkey, metadata, router, relatedReleases } = props;
  const { enqueueSnackbar } = useSnackbar();
  const wallet = useWallet();
  const { releasePurchase, releasePurchasePending, releaseState, getRelease } =
    useContext(ReleaseContext);
  const { getAmountHeld, collection } = useContext(NinaContext);
  const { exchangeState, filterExchangesForReleaseBuySell } =
    useContext(ExchangeContext);
  const [pending, setPending] = useState(undefined);
  const [release, setRelease] = useState(undefined);
  const [amountHeld, setAmountHeld] = useState(collection[releasePubkey]);
  const [amountPendingBuys, setAmountPendingBuys] = useState(0);
  const [amountPendingSales, setAmountPendingSales] = useState(0);

  useEffect(() => {
    getRelease(releasePubkey);
  }, [releasePubkey]);

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey]);
    }
  }, [releaseState.tokenData[releasePubkey]]);

  useEffect(() => {
    setPending(releasePurchasePending[releasePubkey]);
  }, [releasePurchasePending[releasePubkey]]);

  useEffect(() => {
    getAmountHeld(releaseState.releaseMintMap[releasePubkey], releasePubkey);
  }, []);

  useEffect(() => {
    setAmountHeld(collection[releasePubkey]);
  }, [collection[releasePubkey]]);

  useEffect(() => {
    getAmountHeld(releaseState.releaseMintMap[releasePubkey], releasePubkey);
  }, [releasePubkey]);

  useEffect(() => {
    setAmountPendingBuys(
      filterExchangesForReleaseBuySell(releasePubkey, true, true).length
    );
    setAmountPendingSales(
      filterExchangesForReleaseBuySell(releasePubkey, false, true).length
    );
  }, [exchangeState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;

    if (!release.pending) {
      enqueueSnackbar("Making transaction...", {
        variant: "info",
      });
      result = await releasePurchase(releasePubkey);
      if (result) {
        showCompletedTransaction(result);
      }
    }
  };

  const showCompletedTransaction = (result) => {
    enqueueSnackbar(result.msg, {
      variant: result.success ? "success" : "warn",
    });
  };

  if (!release) {
    return (
      <>
        <Dots color="inherit" />
      </>
    );
  }

  const buttonText =
    release.remainingSupply > 0
      ? `Buy $${NinaClient.nativeToUiString(
          release.price.toNumber(),
          release.paymentMint
        )}`
      : `Sold Out ($${NinaClient.nativeToUi(
          release.price.toNumber(),
          release.paymentMint
        ).toFixed(2)})`;

  const buttonDisabled =
    wallet?.connected && release.remainingSupply > 0 ? false : true;

  let pathString = "";
  if (router.pathname.includes("releases")) {
    pathString = "/releases";
  } else if (router.pathname.includes("collection")) {
    pathString = "/collection";
  }

  return (
    <Box>
      <AmountRemaining variant="body2" align="left">
        Remaining: <span>{release.remainingSupply.toNumber()} </span> /{" "}
        {release.totalSupply.toNumber()}
      </AmountRemaining>

      <Typography variant="body2" align="left" paddingBottom="10px">
        Artist Resale: {release.resalePercentage.toNumber() / 10000}%
      </Typography>

      {wallet?.connected && (
        <StyledUserAmount>
          {metadata && (
            <Typography variant="body1" align="left" gutterBottom>
              You have: {amountHeld || 0} {metadata.symbol}
            </Typography>
          )}
          {amountPendingSales > 0 ? (
            <Typography variant="body1" align="left" gutterBottom>
              {amountPendingSales} pending sale
              {amountPendingSales > 1 ? "s" : ""}{" "}
            </Typography>
          ) : null}
          {amountPendingBuys > 0 ? (
            <Typography variant="body1" align="left" gutterBottom>
              {amountPendingBuys} pending buy
              {amountPendingBuys > 1 ? "s" : ""}{" "}
            </Typography>
          ) : null}
        </StyledUserAmount>
      )}
      <StyledDescription variant="h3" align="left">
        {metadata.description}
      </StyledDescription>
      {wallet?.connected &&
        wallet.publicKey.toBase58() === release.authority.toBase58() && (
          <ReleaseSettings releasePubkey={releasePubkey} inCreateFlow={false} />
        )}
      <Box mt={1}>
        <form onSubmit={handleSubmit}>
          <Button
            variant="outlined"
            type="submit"
            disabled={buttonDisabled}
            fullWidth
          >
            <Typography variant="body2">
              {pending ? <Dots msg="awaiting wallet approval" /> : buttonText}
            </Typography>
          </Button>
        </form>
      </Box>
      <Link href={`${pathString}/${releasePubkey}/market`} passHref>
        <MarketButton variant="outlined" fullWidth>
          <Typography variant="body2">Go To Market</Typography>
        </MarketButton>
      </Link>
      {relatedReleases && relatedReleases.length > 1 && (
        <Link href={`/${releasePubkey}/related`} passHref>
          <Button
            variant="outlined"
            fullWidth
            sx={{ marginTop: "15px !important" }}
          >
            <Typography variant="body2">
              See {relatedReleases.length - 1} more related release
              {relatedReleases.length - 1 > 1 ? "s" : ""}
            </Typography>
          </Button>
        </Link>
      )}
    </Box>
  );
};

const AmountRemaining = styled(Typography)(({ theme }) => ({
  paddingBottom: "10px",
  "& span": {
    color: theme.palette.blue,
  },
}));

const StyledUserAmount = styled(Box)(({ theme }) => ({
  color: theme.palette.black,
  ...theme.helpers.baseFont,
  paddingBottom: "10px",
  display: "flex",
  flexDirection: "column",
}));

const StyledDescription = styled(Typography)(({ theme }) => ({
  overflowWrap: "anywhere",
  [theme.breakpoints.up("md")]: {
    maxHeight: "225px",
    overflowY: "scroll",
  },
}));

const MarketButton = styled(Button)(({ theme }) => ({
  marginTop: `${theme.spacing(1)} !important`,
}));

export default ReleasePurchase;
