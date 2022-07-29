import React, { useState, useContext, useEffect, useMemo } from "react";
import axios from "axios";
import { styled } from "@mui/material/styles";
import nina from "@nina-protocol/nina-sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import { useSnackbar } from "notistack";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import Dots from "./Dots";
const HubsModal = dynamic(() => import("./HubsModal"));

import dynamic from "next/dynamic";

const { ReleaseContext, NinaContext, HubContext } = nina.contexts;

const ReleasePurchase = (props) => {
  const { releasePubkey, metadata, inPost, hubPubkey } = props;
  const { enqueueSnackbar } = useSnackbar();
  const wallet = useWallet();
  const router = useRouter();
  const {
    releasePurchaseViaHub,
    releasePurchasePending,
    releasePurchaseTransactionPending,
    releaseState,
    getPublishedHubForRelease,
  } = useContext(ReleaseContext);
  const { hubState } = useContext(HubContext)
  const { getAmountHeld, collection, usdcBalance, ninaClient } = useContext(NinaContext);
  const [release, setRelease] = useState(undefined);
  const [amountHeld, setAmountHeld] = useState(collection[releasePubkey]);
  const [downloadButtonString, setDownloadButtonString] = useState("Download");
  const [userIsRecipient, setUserIsRecipient] = useState(false);
  const [publishedHub, setPublishedHub] = useState();
  const txPending = useMemo(() => releasePurchaseTransactionPending[releasePubkey], [releasePubkey, releasePurchaseTransactionPending])
  const pending = useMemo(() => releasePurchasePending[releasePubkey], [releasePubkey, releasePurchasePending])

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey]);
    }
  }, [releaseState]);

  useEffect(() => {
    setAmountHeld(collection[releasePubkey]);
  }, [collection, releasePubkey]);

  useEffect(() => {
    getAmountHeld(releaseState.releaseMintMap[releasePubkey], releasePubkey);

    const hubForRelease = async (releasePubkey) => {
      const result = await getPublishedHubForRelease(releasePubkey);
      setPublishedHub(result?.hub);
    };
    hubForRelease(releasePubkey);
  }, [releasePubkey, releaseState.releaseMintMap]);

  useEffect(() => {
    if (release?.royaltyRecipients) {
      release.royaltyRecipients.forEach((recipient) => {
        if (
          wallet?.connected &&
          recipient.recipientAuthority.toBase58() ===
            wallet?.publicKey.toBase58() &&
          recipient.percentShare.toNumber() / 10000 > 0
        ) {
          setUserIsRecipient(true);
        }
      });
    }
  }, [release?.royaltyRecipients, wallet?.connected, wallet?.publicKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;

    if (!release.pending) {
      let releasePriceUi = ninaClient.nativeToUi(release.price.toNumber(), ninaClient.ids.mints.usdc)
      let convertAmount = releasePriceUi + (releasePriceUi * hubState[hubPubkey].referralFee / 100)
      if (!ninaClient.isSol(release.releaseMint) && usdcBalance < convertAmount) {
        enqueueSnackbar("Calculating SOL - USDC Swap...", {
          variant: "info",
        });
      } else {
        enqueueSnackbar("Preparing transaction...", {
          variant: "info",
        });
      }
      result = await releasePurchaseViaHub(releasePubkey, hubPubkey);
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
      ? `Buy $${ninaClient.nativeToUiString(
          release.price.toNumber(),
          release.paymentMint
        )}`
      : `Sold Out ($${ninaClient
          .nativeToUi(release.price.toNumber(), release.paymentMint)
          .toFixed(2)})`;

  const buttonDisabled =
    wallet?.connected && release.remainingSupply > 0 ? false : true;

  const downloadAs = async (url, name) => {
    setDownloadButtonString("Downloading");

    const response = await axios.get(url, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      responseType: "blob",
    });
    if (response?.data) {
      const a = document.createElement("a");
      const url = window.URL.createObjectURL(response.data);
      a.href = url;
      a.download = name;
      a.click();
    }
    setDownloadButtonString("Download");
  };

  return (
    <ReleasePurchaseWrapper mt={1}>
      <AmountRemaining variant="body2" align="left">
        Remaining: <span>{release.remainingSupply.toNumber()} </span> /{" "}
        {release.totalSupply.toNumber()}
      </AmountRemaining>

      <Typography variant="body2" align="left" paddingBottom="10px">
        Artist Resale: {release.resalePercentage.toNumber() / 10000}%
      </Typography>
      {wallet?.connected && amountHeld > 0 && (
        <StyledUserAmount>
          {metadata && (
            <Typography variant="body2" align="left">
              You have: {amountHeld || 0} {metadata.symbol}
            </Typography>
          )}
        </StyledUserAmount>
      )}
      {publishedHub && publishedHub.id !== hubPubkey && (
        <Typography variant="body2" align="left" paddingBottom="10px">
          <StyledLink
            href={publishedHub.json.externalUrl}
            passHref
          >
            {`Published via ${publishedHub.json.displayName}`}
          </StyledLink>
        </Typography>
      )}
      <HubsModal releasePubkey={releasePubkey} metadata={metadata}  />

      <form onSubmit={handleSubmit} style={{ textAlign: "left", marginBottom: '10px' }}>
        <BuyButton variant="contained" type="submit" disabled={buttonDisabled} >
          <Typography variant="body2" align="left">
            {txPending &&
              <Dots msg="preparing transaction" />
            }
            {!txPending && pending &&
              <Dots msg="awaiting wallet approval" />
            }
            {!txPending && !pending &&
              buttonText
            }
          </Typography>
        </BuyButton>
      </form>

      {amountHeld > 0 && (
        <BuyButton
          variant="contained"
          sx={{ marginBottom: "10px !important" }}
          onClick={(e) => {
            e.stopPropagation();
            downloadAs(
              metadata.properties.files[0].uri,
              `${metadata.name
                .replace(/[^a-z0-9]/gi, "_")
                .toLowerCase()}___nina.mp3`
            );
          }}
        >
          <Typography variant="body2" align="left">
            {downloadButtonString === "Download" ? (
              "Download"
            ) : (
              <Dots msg={downloadButtonString} />
            )}
          </Typography>
        </BuyButton>
      )}
    </ReleasePurchaseWrapper>
  );
};

const BuyButton = styled(Button)(({ theme }) => ({
  "& p": {
    "&:hover": {
      opacity: "50%",
    },
  },
}));
const ReleasePurchaseWrapper = styled(Box)(({ theme }) => ({
  textAlign: "left",
  [theme.breakpoints.down("md")]: {
    marginTop: "20px",
    marginBottom: "40px",
  },
}));
const AmountRemaining = styled(Typography)(({ theme }) => ({
  paddingBottom: "10px",
  "& span": {
    color: theme.palette.text.primary,
  },
}));

const StyledUserAmount = styled(Box)(({ theme }) => ({
  color: theme.palette.black,
  ...theme.helpers.baseFont,
  paddingBottom: "10px",
  display: "flex",
  flexDirection: "column",
}));
const StyledLink = styled(Link)(() => ({
  "&:hover": {
    cursor: "pointer",
    opacity: "0.5 !import",
  },
  textDecoration: "none",
}));

export default ReleasePurchase;
