import Dashboard from "../../components/Dashboard";
import axios from "axios";
import Head from "next/head";

const DashboardPage = ({ hubPubkey, hub }) => {
  return (
    <>
      <Head>
        <title>{`Nina Hubs - ${hub?.data.displayName} Dashboard`}</title>
        <meta name="og:type" content="website" />
        <meta
          name="description"
          content={`Hubs. Powered by Nina.`} />
        <meta name="og:image" content={hub?.json.image} />    
        <meta name="twitter:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image" content="https://hubs.ninaprotocol.com/images/nina-blue.png" />
        <meta name="og:image" href="https://hubs.ninaprotocol.com/images/nina-blue.png"  />      
      </Head>
      <Dashboard hubPubkey={hubPubkey} />
    </>
  )
};

DashboardPage.getInitialProps = async (context) => {
  const indexerUrl = process.env.INDEXER_URL;
  const hubPubkey = context.query.hubPubkey;

  const indexerPath = indexerUrl + `/hubs/${hubPubkey}`;
  let hub;

  try {
    const result = await axios.get(indexerPath);
    hub = result.data.hub;
    return {
      hub,
      hubPubkey: hub.id,
    };
  } catch (error) {
    console.warn(error);
    return {};
  }
};
export default DashboardPage;
