import Head from "next/head";
import Hub from "../../components/Hub";
import NotFound from "../../components/NotFound";
import NinaSdk from "@nina-protocol/js-sdk"

const HubPage = (props) => {
  const { hub } = props;

  if (!hub) {
    return (
      <>
        <NotFound />
      </>
    )
  }
  return (
    <>
      <Head>
        <title>{`${hub?.data.displayName}`}</title>
        <meta
          name="description"
          content={`${hub?.data.description}\n Powered by Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta name="og:title" content={`${hub?.data.displayName}`} />
        <meta
          name="og:description"
          content={`${hub?.data.description}\n Powered by Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotcol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta name="twitter:title" content={`${hub?.data.displayName}`} />
        <meta name="twitter:description" content={hub?.data.description} />

        <meta name="twitter:image" content={hub?.data.image} />
        <meta name="og:image" content={hub?.data.image} />      
      </Head>
      <Hub hubPubkey={hub.publicKey} />
    </>
  );
};

export default HubPage;

export const getStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          hubPubkey: 'placeholder',
        }
      }
    ],
    fallback: 'blocking'
  }
}

export const getStaticProps = async (context) => {
  const hubPubkey = context.params.hubPubkey;
  if (hubPubkey && hubPubkey !== 'manifest.json' && hubPubkey !== 'undefined') {
    try {
      const { hub } = await NinaSdk.Hub.fetch(hubPubkey);
      return {
        props: {
          hub,
        },
        revalidate: 10
      };
    } catch (error) {
      console.warn(error);
    }
  }
  return {props:{}};
};
