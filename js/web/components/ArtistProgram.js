import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {styled} from '@mui/system'
import EmailCapture from '@nina-protocol/nina-internal-sdk/esm/EmailCapture'

const ArtistProgram = () => {

return(

  <Root>
    <Box sx={{mb: 1}}>
      <Typography variant="h3">
        Nina Artist Program
      </Typography>
    </Box>

  <EmailCapture forceOpen={true} inArtistProgram={true}/>

  </Root>
)

}

const Root = styled(Box)(() => ({
  textAlign: 'left',
  minHeight: '50vh',
  width: '550px'
}))

export default ArtistProgram