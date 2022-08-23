import React, {useState, useEffect, useContext, useMemo} from "react";
import Hub from "@nina-protocol/nina-internal-sdk/esm/Hub";
import Box from "@mui/material/Box";
import {styled} from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {useRouter} from "next/router";
import Link from 'next/link'

const NotFound = (props) => {
  let {hub} = props
  const [hubHandle, setHubHandle] = useState()
  let hubPubkey;
  const {
    saveHubsToState,
    getHubContent,
    hubState
  } = useContext(Hub.Context);
  const router = useRouter();

  useEffect(() => {
    if (hub) {
      saveHubsToState([hub])
    }
  }, [hub])

  useEffect(() => {
    if (router.pathname === '/404') {
      try {
        setHubHandle(router.asPath.split('/')[1])
      } catch (error) {
        console.warn(error)        
      }
    }
  }, [router.path])
  
  useEffect(() => {
    if (hubHandle) {
      getHubContent(hubHandle)
    }
  }, [hubHandle])

  const hubData = useMemo(() => {
    const hub = Object.values(hubState).find(hub => hub.handle === hubHandle)
    return hub
  } , [hubState, hubHandle]);

  return( 
    <StyledBox>
      <Typography variant="h2" align="left">
        There&apos;s nothing here...
      </Typography>

      <Typography variant='h2' align="left" sx={{mt: '15px'}}>
        <Link href='/all'>
            Explore all Hubs
        </Link>
      </Typography>

      {((router.query.hubPostPubkey || router.query.hubReleasePubkey ) && (hub || hubData) ) && (
        <>
          <Typography variant='h2' align="left" sx={{mt: '15px'}}>
            <Link href={`/${router.query.hubPubkey}`}>
              {`Explore ${hub?.json.displayName || hubData?.json.displayName}`}
            </Link>
          </Typography>
        </>
      )}
    </StyledBox>
  );
};

const StyledBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  flexDirection: 'column',
  marginTop: '-125px'
}));

export default NotFound;


