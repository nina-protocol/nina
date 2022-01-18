import React, { useState, useContext, useEffect } from "react";
import { styled } from "@mui/material/styles";
import ninaCommon from "nina-common";
import { useSnackbar } from "notistack";
import Button from "@mui/material/Button";
import { Typography, Box } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import NinaBox from "./NinaBox";
import * as Yup from "yup";
import Link from "next/link";
import AddIcon from '@mui/icons-material/Add';
import HubCreateForm from "./HubCreateForm";


const { ReleaseSettings, Dots } = ninaCommon.components;
const { ConnectionContext, NinaContext, HubContext, } = ninaCommon.contexts;

// const ReleaseCreateSchema = Yup.object().shape({
//   artist: Yup.string().required("Artist Name is Required"),
//   title: Yup.string().required("Title is Required"),
//   description: Yup.string().required("Description is Required"),
//   catalogNumber: Yup.string().required("Catalog Number is Required"),
//   amount: Yup.number().required("Edition Amount is Required"),
//   retailPrice: Yup.number().required("Sale Price is Required"),
//   resalePercentage: Yup.number().required("Resale Percent Amount is Required"),
// });

const Hubs = () => {
  const { enqueueSnackbar } = useSnackbar();
  const wallet = useWallet();
  const { hubInit, hubState } =
    useContext(HubContext);
  const { healthOk } = useContext(ConnectionContext);

  const [buttonText, setButtonText] = useState("Publish Release");
  const [pending, setPending] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const [formValues, setFormValues] = useState({
    hubForm: {},
  });

  // useEffect(() => {
  //   if (pressingState.releasePubkey) {
  //     setReleasePubkey(pressingState.releasePubkey);
  //   }

  //   if (pressingState.completed) {
  //     setButtonText("View Your Release");
  //   }
  // }, [pressingState]);


  const handleFormChange = async (values) => {
    setFormValues({
      ...formValues,
      hubForm: values,
    });
    console.log('formValues :>> ', formValues.hubForm);
  };

  // useEffect(async () => {
  //   const valid = async () =>
  //     await ReleaseCreateSchema.isValid(formValues.releaseForm, {
  //       abortEarly: true,
  //     });
  //   setFormIsValid(await valid());
  // }, [formValues]);

  const handleSubmit = async () => {
      setPending(true);
      const { hubForm } = formValues;
      const data = {
        name: hubForm.name,
        fee: hubForm.fee,
        uri: hubForm.uri,
      };
      console.log('data :>> ', data);
      const success = await hubInit(data);
      if (success) {
        enqueueSnackbar("Hub Created", {
          variant: "info",
        });

      } else {
        enqueueSnackbar("Hub Not Created", {
          variant: "failure",
        });
      }
  };


  return (
    <Box>
      {!healthOk && (
        <NetworkDegradedMessage>
          <Typography variant="h4">{`The Solana network status is currently degraded - there's a chance your upload will fail.`}</Typography>
        </NetworkDegradedMessage>
      )}
    
        <Box style={{display: 'flex', flexDirection: 'column', textAlign: 'left'}}>
          <Typography>
            Welcome to Hubs
          </Typography>
          {!wallet.connected && (
            <Typography align="left" variant="body" gutterBottom>
              Please connect your wallet to start publishing
            </Typography>
          )}
        </Box>
     


      {wallet?.connected  && (
        <Box >
          <HubCreateForm
            onChange={handleFormChange}
            values={formValues.hubForm}
            // ReleaseCreateSchema={ReleaseCreateSchema}
          />
          <Button
            variant="outlined"
            fullWidth
            onClick={handleSubmit}
          >
            Create Hub
          </Button>
        </Box>
      )}
    </Box>
  );
};




const NetworkDegradedMessage = styled(Box)(({ theme }) => ({
  color: theme.palette.red,
  padding: theme.spacing(0,0,1),
}))


export default Hubs;
