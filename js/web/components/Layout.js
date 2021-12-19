import NavBar from "./NavBar";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";

const Layout = ({children, pageTitle, description, ...props}) => {
  console.log('LAYOUT: ', children, pageTitle, description)
  const metadata = children.metadata
  return (
    <>
      {metadata &&
        <Head>
          <title>{`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title}`}</title>
          <meta
            name="description"
            content={`${metadata?.properties.artist} - ${metadata?.properties.title}: ${metadata?.description} \n Published on Nina.`}
          />
          <meta name="og:type" content="website" />
          <meta
            name="og:title"
            content={`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title}`}
          />
          <meta
            name="og:description"
            content={`${metadata?.properties.artist} - ${metadata?.properties.title}: ${metadata?.description} \n Published on Nina.`}
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@nina_market_" />
          <meta name="twitter:creator" content="@nina_market_" />
          <meta
            name="twitter:title"
            content={`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title}`}
          />
          <meta name="twitter:description" content={metadata.description} />
          <meta name="twitter:image" content="https://f4.bcbits.com/img/a0578492136_16.jpg" />
        </Head>
      }
      <Root>
        <Container
          maxWidth={false}
          disableGutters
          className={classes.mainContainer}
        >
          <NavBar />
          <main className={classes.bodyContainer}>{children}</main>
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
    // width: '100vw',
    width: "100vw",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  [`& .${classes.bodyContainer}`]: {
    // display: 'flex',
    // flexDirection: 'column',
    // justifyContent: 'center',
    alignItems: "center",
    position: "relative",
    textAlign: "center",
    height: "100%",
  },
}));

export default Layout;
