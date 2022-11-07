import Hubs from "../components/Hubs";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Nina Hubs</title>
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
        <meta
          name="description"
          content={
            "Hubs are a new way to publish, share, and discuss music.  Powered By Nina."
          }
        />
        <meta name="og:type" content="website" />
        <meta name="og:title" content="Nina Hubs - Create" />
        <meta
          name="og:description"
          content={
            "Hubs are a new way to publish, share, and discuss music.  Powered By Nina."
          }
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/png" />
        <meta name="twitter:title" content="Nina Hubs - Create" />
        <meta
          name="twitter:description"
          content={
            "Hubs are a new way to publish, share, and discuss music.  Powered By Nina."
          }
        />
        <meta
          name="twitter:image"
          content="https://ninaprotocol.com/images/nina-blue.png"
        />
        <meta
          name="og:image"
          href="https://ninaprotocol.com/images/nina-blue.png"
        />
        <meta
          name="description"
          content={"Hubs are a new way to publish, share, and discuss music.  Powered By Nina."}
        />
        <meta name="og:type" content="website" />
        <meta 
          name="og:title"
          content="Nina Hubs - Create"
        />
        <meta
          name="og:description"
          content={"Hubs are a new way to publish, share, and discuss music.  Powered By Nina."}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/png" />
        <meta
          name="twitter:title"
          content="Nina Hubs - Create"
        />
        <meta name="twitter:description" content={"Hubs are a new way to publish, share, and discuss music.  Powered By Nina."} />
        <meta name="twitter:image" content="https://ninaprotocol.com/images/nina-blue.png" />
        <meta name="og:image" href="https://ninaprotocol.com/images/nina-blue.png" />

      </Head>
      <Hubs />
    </>
  );
}
