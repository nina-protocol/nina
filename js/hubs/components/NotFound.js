import Box from "@mui/material/Box";
import {styled} from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {useRouter} from "next/router";
import Link from 'next/link'

const NotFound = (props) => {
  const router = useRouter();

  return( 
    <StyledBox>
      <Typography variant="h2" align="left">
        There's nothing here...
      </Typography>

      <Typography variant='h2' align="left" sx={{mt: '15px'}}>
          <Link href='/all'>
              Explore all Hubs
          </Link>
        </Typography>

      {router.query.hubPostPubkey || router.query.hubReleasePubkey && (
        <>
          <Typography variant='h2' align="left" sx={{mt: '15px'}}>
            <Link href={`/${router.query.hubPubkey}`}>
              {`Explore ${router.query.hubPubkey.replaceAll('-', ' ')}`}
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
