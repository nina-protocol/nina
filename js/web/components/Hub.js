import React, {useState, useContext, useEffect} from "react";
import {useWallet} from "@solana/wallet-adapter-react";
import Typography from '@mui/material/Typography';
import ninaCommon from "nina-common";

import Box from "@mui/material/Box";
import Link from 'next/link'

import {styled} from "@mui/material/styles";
import HubAddArtist from "./HubAddArtist";

import {useRouter} from "next/router";

const {HubContext} = ninaCommon.contexts;

const Hub = () => {
  const router = useRouter();
  const hubPubkey = router.query.hubPubkey;
  const wallet = useWallet();
  const {
    getHub,
    hubState,
    getHubArtists
  } = useContext(HubContext)

  const [hubData, setHubData] = useState(
    hubState[hubPubkey] || null
  )
  const [userIsCurator, setUserIsCurator] = useState(false)

  useEffect(() => {
    if (!hubData) {
      getHub(hubPubkey)
    }
  }, [])
  
  useEffect(() => {
      setHubData(hubState[hubPubkey])
  }, [hubState[hubPubkey]])

  useEffect(() => {
    if (!hubState[hubPubkey]?.hubArtists && hubPubkey) {
      console.log('CALLING');
      getHubArtists(hubPubkey)
    }
  },[hubState[hubPubkey]])


  useEffect(() => {
    if (wallet.connected) {
      if (wallet?.publicKey?.toBase58() === hubData?.account.curator.toBase58()) {
        setUserIsCurator(true)
      }
    }
  }, [hubData, wallet?.connected])

  return (
    <HubWrapper>
       {hubData &&
        <>
          <h1>{hubData.account.name}</h1> 
        {/* {JSON.stringify(hubData, null, 2)} */}
        </>
       }

       {userIsCurator && (
         <>
          <Typography>
            Welcome you your Hub
          </Typography>


          <Box>
            <Link href={`/hubs/${hubPubkey}/upload`}>
              Upload a track through your Hub
            </Link>
          </Box>

        {/* 
          <Box width="40%">
            <Typography>
                add an artist to your hub
            </Typography>

            <HubAddArtist hubPubkey={hubPubkey} />
          </Box> */}
         </>
       )}


    </HubWrapper>
  );
};

const HubWrapper = styled(Box)(() => ({
  border: '2px solid red',
  width: '80vw'
}));


export default Hub;
 