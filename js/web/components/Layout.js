import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import AudioPlayer from "./AudioPlayer"
import NavBar from "./NavBar";

const Layout = ({ children }) => {
  if (children.props.isEmbed) {
    return <main className={classes.bodyContainer}>{children}</main>;
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

const Root = styled("div")(() => ({
  [`& .${classes.mainContainer}`]: {
    minHeight: "100vh",
    height: "100vh",
    width: "100vw",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  [`& .${classes.bodyContainer}`]: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    textAlign: "center",
    height: "100%",
  },
}));

export default Layout;
