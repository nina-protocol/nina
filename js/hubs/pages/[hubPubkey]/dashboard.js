import Dashboard from "../../components/Dashboard";
import NinaSdk from "@nina-protocol/nina-sdk";

const DashboardPage = ({ hub }) => {
  return (
    <>
      <Dashboard hubPubkey={hub.publicKey} />
    </>
  );
};

DashboardPage.getInitialProps = async (context) => {
  try {
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
