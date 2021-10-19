import React from 'react'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const PREFIX = 'HomePage';

const classes = {
  root: `${PREFIX}-root`
};

const StyledBox = styled(Box)((
  {
    theme
  }
) => ({
  [`&.${classes.root}`]: {
    color: theme.palette.black,
  }
}));

const HomePage = () => {

  return (
    <StyledBox className={classes.root}>
      <Typography>Im the Homepage</Typography>
    </StyledBox>
  );
}

export default HomePage
