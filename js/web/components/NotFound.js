import React, {useState, useEffect, useContext, useMemo} from "react";
import Hub from "@nina-protocol/nina-sdk/esm/Hub";
import Box from "@mui/material/Box";
import {styled} from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {useRouter} from "next/router";
import Link from 'next/link'

const NotFound = (props) => {
  let {release} = props
  const [hubHandle, setHubHandle] = useState()
  const router = useRouter();

  return (
    <StyledBox>
      <Typography variant="h2" align="left">
        There&apos;s nothing here...
      </Typography>

      <BlueTypography variant='h2' align="left" sx={{mt: '15px', color: `palette.blue` }}>
        <Link href='/releases'>
          Explore all Releases
        </Link>
      </BlueTypography>

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

const BlueTypography = styled(Typography)(({theme}) => ({
  '& a': {color: theme.palette.blue},
}))


