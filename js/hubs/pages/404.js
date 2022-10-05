import NotFound from "../components/NotFound";
import Head from "next/head";

const NotFoundPage = (props) => {
  return(
    <>
      <Head>
        <title>Nina Hubs - Not Found</title>
        <meta
          name="description"
          content={"Nina Protocol is a digitally native music ecosystem"}
        />
        <meta name="og:type" content="website" />
        <meta 
          name="og:title"
          content="Nina Hubs - Not Found"
        />
        <meta
          name="og:description"
          content={"Nina Protocol is a digitally native music ecosystem"}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/png" />
        <meta
          name="twitter:title"
          content="Nina Hubs - Not Found"
        />
        <meta name="twitter:description" content={"Nina Protocol is a digitally native music ecosystem"} />
        <meta name="twitter:image" content="https://ninaprotocol.com/images/nina-blue.png" />
        <meta name="og:image" href="https://ninaprotocol.com/images/nina-blue.png" />
      </Head>
      <NotFound />
    </>
  );
};

export default NotFoundPage;

