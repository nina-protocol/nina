import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const Layout = ({ children }) => {
  return (
      <Root>
        <CssBaseline />
        <Container
          maxWidth={true}
          disableGutters
          className={classes.mainContainer}
        >
          <main className={classes.bodyContainer}>{children}</main>
        </Container>
      </Root>
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
    height: "100%",
    paddingLeft: theme.spacing(1),
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(0, 1),
      height: 'unset',
      minHeight: '100%',
    },
  },
}));

export default Layout;
