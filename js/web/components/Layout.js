import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Head from "next/head";
import CssBaseline from '@mui/material/CssBaseline'


import NavBar from "./NavBar";
import AudioPlayer from "./AudioPlayer";

const Layout = ({children, pageTitle, description, ...props}) => {
  const metadata = children.props.metadata

  if (children.props.isEmbed) {
     return <main className={classes.bodyContainer}>{children}</main>
  }
  return (
    <>
      <Root>
        <CssBaseline />
        <Container
          maxWidth={false}
          disableGutters
          className={classes.mainContainer}
        > 
          <NavBar />
          <main className={classes.bodyContainer}>{children}</main>
          <AudioPlayer />
        </Container>
      </Root>
    </>
  );
};

const PREFIX = "Layout";

const classes = {
  mainContainer: `${PREFIX}-mainContainer`,
  bodyContainer: `${PREFIX}-bodyContainer`,
};

const Root = styled("div")(({theme}) => ({
  [`& .${classes.mainContainer}`]: {
    minHeight: "100vh",
    // width: '100vw',
    width: "100vw",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    [theme.breakpoints.down("md")]: {
      overflowY: "scroll",
    },
  },

  [`& .${classes.bodyContainer}`]: {

    alignItems: "center",
    position: "relative",
    textAlign: "center",
    height: "100%",
    [theme.breakpoints.down("md")]: {
     display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    },
  },
}));

export default Layout;
