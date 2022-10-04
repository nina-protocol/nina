import Dashboard from "../../components/Dashboard";
import NinaSdk from "@nina-protocol/js-sdk";

const DashboardPage = ({ hub }) => {
  return (
    <>
      <Dashboard hubPubkey={hub.publicKey} />
    </>
  );
};

DashboardPage.getInitialProps = async (context) => {
  try {
    if (!NinaSdk.client.program) {
      await NinaSdk.client.init(
        process.env.NINA_API_ENDPOINT,
        process.env.SOLANA_CLUSTER_URL,
        process.env.NINA_PROGRAM_ID
      )      
    }
    const { hub } = await NinaSdk.Hub.fetch(context.query.hubPubkey);
    return {
      hub,
    };
  } catch (error) {
    console.warn(error);
    return {};
  }
};
export default DashboardPage;
