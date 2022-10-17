import React from 'react';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";


const NewUserProfile = (props) => {
  return (
    <NewUserWrapper border="2px solid red" display>
      <Typography align='left' variant="h2" my={1}>Welcome to your Dashboard</Typography>

      <Typography align='left' my={1}>Open the drawer on the right to see your suggestions.</Typography>

      <Typography align='left' my={1}>After following a few Hubs or Profiles, your feed will be generated.</Typography>
    
      <Typography align='left' my={1}>Once you start collecting, your collected Releases will be visable here</Typography>
      
      <Typography align='left' my={1}>If you create Hubs or Releases, this will be your home for stats and collecting revenue.</Typography>
    
      <Typography align='left' my={1}>You can also edit your profile here.</Typography>
    </NewUserWrapper>
  );
};

export default NewUserProfile;

const NewUserWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'left',
}));