import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Head from "next/head";

import NavBar from "./NavBar";

const Layout = ({children, pageTitle, description, ...props}) => {
  const metadata = children.props.metadata
  return (
    <>
      <Head>
        <meta content="text/html; charset=UTF-8" name="Content-Type" />
        <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
        <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
        <script src="https://cdn.dashjs.org/v3.2.1/dash.all.min.js"></script>

        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="shortcut icon"
          type="image/png"
          sizes="32x32"
          href="/public/favicon-32x32.png"
        />
        <link
          rel="shortcut icon"
          type="image/png"
          sizes="16x16"
          href="/public/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
        />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-VDD58V1D22"
        ></script>
        {() => {
          window.dataLayer = window.dataLayer || [];
          const gtag = () => window.dataLayer.push(arguments);
          gtag("js", new Date());
          gtag("config", "G-VDD58V1D22");
        }}
        {metadata &&
          <>
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
          </>
        }
        {!metadata &&
          <meta
            name="description"
            content="Nina: A new way to publish, stream, and purchase music."
          />
        }
      </Head>
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
