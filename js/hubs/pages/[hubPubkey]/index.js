import * as anchor from "@project-serum/anchor";
import axios from "axios";
import Head from "next/head";
import {hrtime} from "process";
import Hub from "../../components/Hub";

const HubPage = (props) => {
  const { hub, hubPubkey } = props;
  return (
    <>
      <Head>
        <title>{`${hub?.json.displayName}`}</title>
        <meta
          name="description"
          content={`${hub?.json.description}\n Powered by Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta name="og:title" content={`${hub?.json.displayName}`} />
        <meta
          name="og:description"
          content={`${hub?.json.description}\n Powered by Nina.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotcol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta name="twitter:title" content={`${hub?.json.displayName}`} />
        <meta name="twitter:description" content={hub?.json.description} />

        <meta name="twitter:image" content={hub?.json.image} />
        <meta name="og:image" content={hub?.json.image} />
      

      </Head>
      <Hub hubPubkey={hubPubkey} />
    </>
  );
};

export default HubPage;

// export const getServerSideProps = async (context) => {
//   const indexerUrl = process.env.INDEXER_URL;
//   const hubPubkey = context.query.hubPubkey;
//   const indexerPath = indexerUrl + `/hubs/${hubPubkey}`;
  
//   let hub;
//   if (hubPubkey && hubPubkey !== 'manifest.json') {
//     try {
//       const result = await axios.get(indexerPath);
//       const data = result.data;
//       hub = data.hub;
  
//       return {
//         props: {
//           hub,
//           hubPubkey: hub.id,
//         },
//       };
//     } catch (error) {
//       console.warn(error);
//     }
//   }
//   return {props:{}};
// };

export const getStaticProps = async (context) => {
  const indexerUrl = process.env.INDEXER_URL;
  const hubPubkey = context.params.hubPubkey;
  const indexerPath = indexerUrl + `/hubs/${hubPubkey}`;

  let hub;
  if (hubPubkey && hubPubkey !== 'manifest.json') {
    try {
      const result = await axios.get(indexerPath);
      const data = result.data;
      hub = data.hub;

      return {
        props: {
          hub,
          hubPubkey: hub.id,
        },
      };
    } catch (error) {
      console.warn(error);
    }
  }
  return {props:{}};
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  }
}