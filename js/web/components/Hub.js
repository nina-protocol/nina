import React, {useState, useContext, useEffect} from "react";
import {useWallet} from "@solana/wallet-adapter-react";
import ninaCommon from "nina-common";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import {styled} from "@mui/material/styles";
import NinaBox from "./NinaBox";
import ReleaseCard from "./ReleaseCard";
import ReleasePurchase from "./ReleasePurchase";
import {useRouter} from "next/router";

const {Dots} = ninaCommon.components;
const {HubContext} = ninaCommon.contexts;

const Hub = () => {
  const router = useRouter();
  const hubPubkey = router.query.hubPubkey;
  const wallet = useWallet();
  const {
    getHub,
    hubState
  } = useContext(HubContext)

  const [hubData, setHubData] = useState(
    hubState[hubPubkey] || null
  )

  useEffect(() => {

    if (!hubData) {
      console.log('getting');
      getHub(hubPubkey)
    }
  }, [])
  
  useEffect(() => {
    setHubData(hubState[hubPubkey])
  }, [hubState])

  return (
    <>
       {hubData &&
        <>
          <h1>This name of this hub is {hubData.account.name}</h1> 
        </>
       }
    </>
  );
};



export default Hub;
