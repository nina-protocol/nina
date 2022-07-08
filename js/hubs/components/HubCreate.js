import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import * as Yup from "yup";
import nina from "@nina-protocol/nina-sdk";
import { useSnackbar } from "notistack";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import HubCreateForm from "./HubCreateForm";
import HubCreateConfirm from "./HubCreateConfirm";
import NinaBox from "./NinaBox";
import HubImageDropzone from "./HubImageDropzone";
import Dots from "./Dots";
import BundlrModal from "./BundlrModal";
import axios from "axios";
import Link from "next/link";

const ColorModal = dynamic(() => import("./ColorModal"));

import {
  createUpload,
  updateUpload,
  removeUpload,
  UploadType,
  uploadHasItemForType,
} from "../utils/uploadManager";

const { NinaContext, HubContext } = nina.contexts;

const HubCreateSchema = Yup.object().shape({
  handle: Yup.string().required("Hub Handle is Required"),
  displayName: Yup.string().required("Display Name is Required"),
  publishFee: Yup.number().required("Publish Fee is Required"),
  referralFee: Yup.number().required("Referral Fee is Required"),
  description: Yup.string(),
});

const HubCreate = ({ update, hubData }) => {
  const { enqueueSnackbar } = useSnackbar();
  const wallet = useWallet();
  const {
    hubInitWithCredit,
    hubState,
    hubUpdateConfig,
    getHubs,
    validateHubHandle,
  } = useContext(HubContext);
  const router = useRouter();
  const {
    healthOk,
    bundlrUpload,
    bundlrBalance,
    getBundlrBalance,
    bundlrFund,
    bundlrWithdraw,
    getBundlrPricePerMb,
    bundlrPricePerMb,
    solPrice,
    getSolPrice,
    getNpcAmountHeld,
    npcAmountHeld,
  } = useContext(NinaContext);

  const [artwork, setArtwork] = useState();
  const [uploadSize, setUploadSize] = useState();
  const [hubPubkey, setHubPubkey] = useState(hubData?.id || undefined);
  const [buttonText, setButtonText] = useState(
    update ? "Update Hub" : "Create Hub"
  );
  const [pending, setPending] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const [formValues, setFormValues] = useState({
    hubForm: {},
  });
  const [backgroundColor, setBackgroundColor] = useState();
  const [textColor, setTextColor] = useState();
  const [formValuesConfirmed, setFormValuesConfirmed] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hubInfo, setHubInfo] = useState();
  const [artworkTx, setArtworkTx] = useState();
  const [metadataTx, setMetadataTx] = useState();
  const [hubCreated, setHubCreated] = useState(false);
  const [hubUpdated, setHubUpdated] = useState(false);
  const [uploadId, setUploadId] = useState();
  const [hubHandleValid, setHubHandleValid] = useState(false);
  const [publishingStepText, setPublishingStepText] = useState();

  const mbs = useMemo(
    () => bundlrBalance / bundlrPricePerMb,
    [bundlrBalance, bundlrPricePerMb]
  );
  const bundlrUsdBalance = useMemo(
    () => bundlrBalance * solPrice,
    [bundlrBalance, solPrice]
  );

  useEffect(() => {
    refreshBundlr();
  }, []);

  const refreshBundlr = () => {
    getBundlrPricePerMb();
    getBundlrBalance();
    getSolPrice();
  };

  useEffect(() => {
    getNpcAmountHeld();
  }, [wallet?.connected]);

  useEffect(() => {
    if (isPublishing) {
      if (!artworkTx) {
        setPublishingStepText(
          "1/3 Uploading Artwork.  Please confirm in wallet and do not close this window."
        );
      } else if (!metadataTx) {
        setPublishingStepText(
          "2/3 Uploading Metadata.  Please confirm in wallet and do not close this window."
        );
      } else {
        setPublishingStepText(
          "3/3 Finalizing Hub.  Please confirm in wallet and do not close this window."
        );
      }
    } else {
      if (artworkTx && !metadataTx) {
        setButtonText("Restart 2/3: Upload Metadata.");
      } else if (artworkTx && metadataTx && !hubCreated) {
        setButtonText("Restart 3/3: Finalize Hub");
      } else if (mbs < uploadSize) {
        setButtonText(
          `Upload requires more storage than available in your bundlr account, please top up`
        );
      }
    }
  }, [artworkTx, metadataTx, isPublishing, hubCreated, bundlrBalance]);

  useEffect(() => {
    if (hubData?.json.backgroundColor) {
      setBackgroundColor(hubData.json.backgroundColor);
    }
    if (hubData?.json.textColor) {
      setTextColor(hubData.json.textColor);
    }
  }, [hubData?.json]);

  const handleFormChange = useCallback(
    async (values) => {
      setFormValues({
        ...formValues,
        hubForm: values,
      });
    },
    [formValues]
  );
  
  useEffect(() => {
    if (update) {
      //double check that this works
      setFormIsValid(true);
      setFormValuesConfirmed(true)
      return;
    }
    if (artwork) {
      const valid = async () => {
        const isValid = await HubCreateSchema.isValid(formValues.hubForm, {
          abortEarly: true,
        });
        setFormIsValid(isValid);
      };
      valid();
    }
  }, [formValues, artwork]);

  useEffect(() => {
    const artworkSize = artwork ? artwork.meta.size / 1000000 : 0;
    setUploadSize(artworkSize.toFixed(2));
  }, [artwork]);

  const colorReset = () => {
    setBackgroundColor();
    setTextColor();
  };

  const handleSubmit = async () => {
    try {
      if (update) {
        let upload = uploadId;
        const metadataJson = {};
        let metadataResult = metadataTx;

        if (artwork) {
          let artworkResult = artworkTx;
          setIsPublishing(true);
          enqueueSnackbar(
            "Uploading artwork to Arweave.  Please confirm in wallet.",
            {
              variant: "info",
            }
          );
          artworkResult = (await bundlrUpload(artwork.file)).data.id;
          setArtworkTx(artworkResult);
          metadataJson.image = `https://arweave.net/${artworkResult}`;

          upload = createUpload(
            UploadType.artwork,
            artworkResult,
            formValues.hubForm
          );
          setUploadId(upload);
        } else {
          metadataJson.image = hubData.json.image;
          upload = createUpload(
            UploadType.artwork,
            metadataJson.image,
            formValues.hubForm
          );
          setUploadId(upload);
        }

        if (!uploadHasItemForType(upload, UploadType.metadataJson)) {
          setIsPublishing(true);
          enqueueSnackbar(
            "Uploading Hub Info to Arweave.  Please confirm in wallet.",
            {
              variant: "info",
            }
          );

          metadataJson = {
            ...metadataJson,
            displayName: formValues.hubForm.displayName
              ? formValues.hubForm.displayName
              : hubData.json.displayName,
            description: formValues.hubForm.description
              ? formValues.hubForm.description
              : hubData.json.description,
            externalUrl: formValues.hubForm.externalUrl
              ? formValues.hubForm.externalUrl
              : hubData.json.externalUrl,
          };
          if (backgroundColor) {
            metadataJson.backgroundColor = backgroundColor;
          }
          if (textColor) {
            metadataJson.textColor = textColor;
          }

          metadataResult = (
            await bundlrUpload(
              new Blob([JSON.stringify(metadataJson)], {
                type: "application/json",
              })
            )
          ).data.id;
          setMetadataTx(metadataResult);
          updateUpload(upload, UploadType.metadataJson, metadataResult);
        }

        if (
          uploadHasItemForType(upload, UploadType.metadataJson) ||
          metadataResult
        ) {
          setIsPublishing(true);
          enqueueSnackbar("Finalizing Hub.  Please confirm in wallet.", {
            variant: "info",
          });

          const result = await hubUpdateConfig(
            hubPubkey,
            `https://arweave.net/${metadataResult}`,
            formValues.hubForm.publishFee,
            formValues.hubForm.referralFee
          );

          if (result?.success) {
            enqueueSnackbar("Hub Updated!", {
              variant: "success",
            });

            removeUpload(upload);
            setIsPublishing(false);
          } else {
            enqueueSnackbar(result.msg, {
              variant: "error",
            });
          }
        }
      } else {
        if (artwork && (await validateHubHandle(formValues.hubForm.handle))) {
          let upload = uploadId;
          let artworkResult = artworkTx;
          if (!uploadId) {
            setIsPublishing(true);
            enqueueSnackbar(
              "Uploading Hub Image to Arweave.  Please confirm in wallet.",
              {
                variant: "info",
              }
            );
            artworkResult = (await bundlrUpload(artwork.file)).data.id;
            setArtworkTx(artworkResult);
            upload = createUpload(
              UploadType.artwork,
              artworkResult,
              formValues.hubForm
            );
            setUploadId(upload);
          }
          if (
            uploadHasItemForType(upload, UploadType.artwork) ||
            artworkResult
          ) {
            let metadataResult = metadataTx;

            if (!uploadHasItemForType(upload, UploadType.metadataJson)) {
              enqueueSnackbar(
                "Uploading Hub Info to Arweave.  Please confirm in wallet.",
                {
                  variant: "info",
                }
              );

              const metadataJson = {
                displayName: formValues.hubForm.displayName,
                description: formValues.hubForm.description,
                externalUrl: `https://hubs.ninaprotocol.com/${formValues.hubForm.handle}`,
                image: `https://arweave.net/${artworkResult}`,
              };

              metadataResult = (
                await bundlrUpload(
                  new Blob([JSON.stringify(metadataJson)], {
                    type: "application/json",
                  })
                )
              ).data.id;
              setMetadataTx(metadataResult);
              updateUpload(upload, UploadType.metadataJson, metadataResult);
            }
            if (
              uploadHasItemForType(upload, UploadType.metadataJson) ||
              metadataResult
            ) {
              enqueueSnackbar("Finalizing Hub.  Please confirm in wallet.", {
                variant: "info",
              });

              const hubParams = {
                handle: formValues.hubForm.handle,
                publishFee: formValues.hubForm.publishFee,
                referralFee: formValues.hubForm.referralFee,
                uri: `https://arweave.net/${metadataResult}`,
              };

              const result = await hubInitWithCredit(hubParams);
              if (result?.success) {
                enqueueSnackbar("Hub Created!", {
                  variant: "success",
                });

                removeUpload(upload);
                setIsPublishing(false);
                setHubCreated(true);
                setHubPubkey(result.hubPubkey);
              } else {
                enqueueSnackbar("Hub Not Created", {
                  variant: "error",
                });
              }
            }
          }
        } else {
          setFormValuesConfirmed(false);
        }
      }
    } catch (error) {
      setIsPublishing(false);
      console.warn(error);
    }
  };

  if (hubCreated) {
    return (
      <Box margin="auto">
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          onClick={() => router.push(`/${hubPubkey}`)}
          sx={{ height: "54px" }}
        >
          {`${formValues.hubForm.displayName}  has been created!  View Hub.`}
        </Button>
      </Box>
    );
  }

  return (
    <StyledGrid item md={12} >
      {!wallet.connected && (
        <ConnectMessage variant="body" gutterBottom>
          Please connect your wallet to create a hub
        </ConnectMessage>
      )}

      {!update && wallet?.connected && npcAmountHeld === 0 && (
        <Box width="50%" margin="24vh auto">
          <BlueTypography
            variant="h1"
            align="left"
            sx={{ padding: { md: "0px 150pxx", xs: "30px 0px" } }}
          >
            You do not have any credits to create a Hub. Please{` `}
            <Link
              href="https://docs.google.com/forms/d/e/1FAIpQLScSdwCMqUz6VGqhkO6xdfUxu1pzdZEdsGoXL9TGDYIGa9t2ig/viewform"
              target="_blank"
              rel="noreferrer"
              passHref
            >
              apply
            </Link>{" "}
            here to get started.
          </BlueTypography>
        </Box>
      )}

      {update && (
        <Typography gutterBottom>
          Updating {hubData.json.displayName}
        </Typography>
      )}
      {!update && (
        <Typography variant="h3" gutterBottom>
          Create Hub
        </Typography>
      )}
      {wallet?.connected && (update || npcAmountHeld > 0) > 0 && (
        <NinaBox columns="500px" gridColumnGap="10px">
          <CreateFormWrapper>
            <HubCreateForm
              onChange={handleFormChange}
              values={formValues.hubForm}
              HubCreateSchema={HubCreateSchema}
              update={update}
              hubData={hubData}
            />

            <DropzoneWrapper>
              <HubImageDropzone
                setArtwork={setArtwork}
                values={formValues}
                type="artwork"
                currentImageUrl={update ? hubData.json.image : null}
                update={update}
              />
            </DropzoneWrapper>

            <ColorWrapper>
              <ColorModal
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
                textColor={textColor}
                setTextColor={setTextColor}
                colorReset={colorReset}
              />

              {backgroundColor && (
                <Typography
                  mt={1}
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
            </ColorWrapper>

            {formValues.hubForm.publishFee > 30 ||
              (formValues.hubForm.referralFee > 30 && (
                <Box>
                  <Warning variant="subtitle1">
                    Are you certain about the fees you set? High fees may
                    discourage potential collectors.
                  </Warning>
                </Box>
              ))}
          </CreateFormWrapper>

          <CreateCta>
            {bundlrBalance === 0 && <BundlrModal inCreate={true} />}

            {bundlrBalance > 0 && formValuesConfirmed && (update || isPublishing ) && (
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleSubmit}
                disabled={
                  isPublishing ||
                  !formIsValid ||
                  bundlrBalance === 0 ||
                  mbs < uploadSize ||
                  artwork?.meta.status === "uploading"
                }
                sx={{ height: "54px" }}
              >
                {isPublishing && <Dots msg={publishingStepText} />}
                {!isPublishing && buttonText} 
              </Button>
            )}

            {bundlrBalance > 0 && !formValuesConfirmed && (
              <HubCreateConfirm
                hubData={hubData}
                formValues={formValues}
                formIsValid={formIsValid}
                handleSubmit={handleSubmit}
                setFormValuesConfirmed={setFormValuesConfirmed}
                update={update}
                backgroundColor={backgroundColor}
                textColor={textColor}
              />
            )}

            {pending && (
              <LinearProgress
                variant="determinate"
                value={audioProgress || imageProgress}
              />
            )}

            <Box display="flex" justifyContent="space-between">
              {bundlrBalance > 0 && (
                <BundlrBalanceInfo variant="subtitle1" align="left">
                  Bundlr Balance: {bundlrBalance?.toFixed(4)} SOL / $
                  {bundlrUsdBalance.toFixed(2)} / {mbs?.toFixed(2)} MB ($
                  {(bundlrUsdBalance / mbs)?.toFixed(4)}/MB)
                </BundlrBalanceInfo>
              )}
              {bundlrBalance === 0 && (
                <BundlrBalanceInfo variant="subtitle1" align="left">
                  Please fund your Upload Account to enable publishing
                </BundlrBalanceInfo>
              )}
              {uploadSize > 0 && (
                <Typography variant="subtitle1" align="right">
                  Upload Size: {uploadSize} MB
                </Typography>
              )}
            </Box>
          </CreateCta>
        </NinaBox>
      )}
    </StyledGrid>
  );
};

const StyledGrid = styled(Grid)(() => ({
  maxHeight: '90vh',
  overflowY: 'scroll',
  justifyContent: 'center',
  alignItems: 'center'
}));

const ConnectMessage = styled(Typography)(() => ({
  gridColumn: "1/3",
  paddingTop: "30px",
}));

const CreateFormWrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  minHeight: "476px",
  margin: "0px auto ",
  display: "flex",
  flexDirection: "column",
  gridColumn: "1/3",
  border: `1px solid ${theme.palette.grey.primary}`,
}));

const CreateCta = styled(Box)(({ theme }) => ({
  gridColumn: "1/3",
  width: "100%",
  position: "relative",
  "& .MuiButton-root": {
    ...theme.helpers.baseFont,
  },
}));

const DropzoneWrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: "0 15px",
}));

const BundlrBalanceInfo = styled(Typography)(({ theme }) => ({
  whiteSpace: "nowrap",
  margin: "5px 0",
}));

const ColorWrapper = styled(Box)(({ theme }) => ({
  textAlign: "left",
  padding: "5px 15px 15px",
}));

const Warning = styled(Typography)(({ theme }) => ({
  textTransform: "none !important",
  color: theme.palette.red,
  opacity: "85%",
}));

const BlueTypography = styled(Typography)(({ theme }) => ({
  "& a": {
    color: theme.palette.blue,
    textDecoration: "none",
  },
}));

export default HubCreate;
