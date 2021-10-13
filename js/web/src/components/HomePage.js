import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';


const HomePage = () => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Typography>
        Im the Homepage
      </Typography>
    </Box>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.vars.black
  }
}));

export default HomePage