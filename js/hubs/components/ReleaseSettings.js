import { useState, useEffect, useContext } from "react";
import { styled } from "@mui/material/styles";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Nina from "@nina-protocol/nina-internal-sdk/esm/Nina";
import Release from "@nina-protocol/nina-internal-sdk/esm/Release";
const Royalty = dynamic(() => import("./Royalty.js"));

const ReleaseSettings = (props) => {
  const { releasePubkey, tempMetadata, inCreateFlow } = props;
  const { ninaClient } = useContext(Nina.Context);
  const { releaseState } = useContext(Release.Context);
  const [release, setRelease] = useState(releaseState.tokenData[releasePubkey]);
  const [metadata, setMetadata] = useState(
    releaseState.metadata[releasePubkey]
  );
  const [displayValues, setDisplayValues] = useState({});

  useEffect(() => {
    setMetadata(releaseState.metadata[releasePubkey]);
  }, [releaseState.metadata[releasePubkey]]);

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey]);
    }
  }, [releaseState.tokenData[releasePubkey]]);

  useEffect(() => {
    if (metadata) {
      setDisplayValues({
        artist: metadata.properties.artist,
        title: metadata.properties.title,
        description: metadata.description,
        catalogNumber: metadata.symbol,
      });
    } else {
      setDisplayValues({
        artist: tempMetadata?.artist,
        title: tempMetadata?.title,
        description: tempMetadata?.description,
        catalogNumber: tempMetadata?.catalogNumber,
      });
    }
  }, [tempMetadata, metadata]);

  if (!release) {
    return null;
  }
  return (
    <StyledBox>
      <ReleaseInfoWrapper>
        {inCreateFlow && (
          <Typography variant="h4" gutterBottom>
            Confirm Release Info
          </Typography>
        )}
        <ReleaseInfo className={inCreateFlow ? "inCreateFlow" : ""}>
          <ReleaseStat variant="body1" component="p">
            <ReleaseStatLeft variant="subtitle1">Catalog No.</ReleaseStatLeft>
            <ReleaseStatRight variant="subtitle1">
              {" "}
              {displayValues.catalogNumber}{" "}
            </ReleaseStatRight>
          </ReleaseStat>

          <ReleaseStat variant="body1" component="p">
            <ReleaseStatLeft variant="subtitle1">Amount</ReleaseStatLeft>
            <ReleaseStatRight variant="subtitle1">
              {release?.totalSupply.toNumber()}
            </ReleaseStatRight>
          </ReleaseStat>

          <ReleaseStat variant="body1" component="p">
            <ReleaseStatLeft variant="subtitle1">Cost USD</ReleaseStatLeft>
            <ReleaseStatRight variant="subtitle1">
              {ninaClient.nativeToUiString(
                release?.price.toNumber(),
                release?.paymentMint,
                false,
                false
              )}
            </ReleaseStatRight>
          </ReleaseStat>

          <ReleaseStat variant="body1" component="p">
            <ReleaseStatLeft variant="subtitle1">Resale %</ReleaseStatLeft>
            <ReleaseStatRight variant="subtitle1">
              {" "}
              {release?.resalePercentage.toNumber() / 10000}%
            </ReleaseStatRight>
          </ReleaseStat>
          {!inCreateFlow && (
            <>
              <ReleaseStat variant="body1" component="p">
                <ReleaseStatLeft variant="subtitle1">
                  Primary Sales
                </ReleaseStatLeft>
                <ReleaseStatRight variant="subtitle1">
                  {release?.saleCounter.toNumber()}
                </ReleaseStatRight>
              </ReleaseStat>
              <ReleaseStat variant="body1" component="p">
                <ReleaseStatLeft variant="subtitle1">
                  Secondary Sales
                </ReleaseStatLeft>
                <ReleaseStatRight variant="subtitle1">
                  {release?.exchangeSaleCounter.toNumber()}
                </ReleaseStatRight>
              </ReleaseStat>
              <ReleaseStat variant="body1" component="p">
                <ReleaseStatLeft variant="subtitle1">
                  Total Earnings
                </ReleaseStatLeft>
                <ReleaseStatRight variant="subtitle1">
                  {ninaClient.nativeToUiString(
                    release?.totalCollected.toNumber(),
                    release?.paymentMint
                  )}
                </ReleaseStatRight>
              </ReleaseStat>
            </>
          )}
          {inCreateFlow && (
            <Typography
              variant="body1"
              component="p"
              sx={{ marginTop: "10px !important" }}
            >
              {displayValues.description}
            </Typography>
          )}
        </ReleaseInfo>

        <Box mt={1} textAlign="left">
          <Royalty releasePubkey={releasePubkey} release={release} />

          <SettingsButton
            variant="contained"
            sx={{ margin: "15px 0!important" }}
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?text=${`${displayValues.artist} - "${displayValues.title}" on Nina%0A`}&url=ninaprotocol.com/${releasePubkey}`,
                null,
                "status=no,location=no,toolbar=no,menubar=no,height=500,width=500"
              )
            }
          >
            <Typography variant="body2">Share to Twitter</Typography>
          </SettingsButton>
          {inCreateFlow && (
            <Button
              variant="contained"
              color="primary"
              disabled={!metadata}
              sx={{ marginTop: "10px !important" }}
            >
              <Link href={`/${releasePubkey}`} passHref>
                <Typography variant="body2">
                  {metadata
                    ? "View Release"
                    : "Your release is currently being finalized..."}
                </Typography>
              </Link>
            </Button>
          )}
        </Box>
      </ReleaseInfoWrapper>
    </StyledBox>
  );
};
const SettingsButton = styled(Button)(({ theme }) => ({
  "& p": {
    "&:hover": {
      opacity: "50%",
    },
  },
}));

const StyledBox = styled(Box)(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

const ReleaseInfoWrapper = styled(Box)(() => ({
  width: "100%",
  margin: "auto",
  textAlign: "left",
}));

const ReleaseInfo = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  "& .inCreateFlow": {
    border: `1px solid ${theme.palette.grey.primary}`,
    padding: "20px",
  },
}));

const ReleaseStatRight = styled(Typography)(() => ({
  fontWeight: "bold",
}));

const ReleaseStatLeft = styled(Typography)(() => ({
  width: "140px",
}));

const ReleaseStat = styled(Typography)(() => ({
  display: "flex",
  "& span": {
    width: "75px",
  },
  "& strong": {
    paddingLeft: "15px",
  },
}));
export default ReleaseSettings;
