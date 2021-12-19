import ninaCommon from "nina-common";
import Head from "next/head";
import ReleaseRelated from "../../components/ReleaseRelated";

const { NinaClient } = ninaCommon.utils;

const Related = (props) => {
  const { metadata } = props;
  return (
    <>
      <Head>
        <title>{`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title} (Related)`}</title>
        <meta
          name="description"
          content={`Releases related to ${metadata?.properties.artist} - ${metadata?.properties.title}. \n Published on Nina.`}
        />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`Nina: ${metadata?.properties.artist} - ${metadata?.properties.title} (Related)`}
        />
        <meta
          name="og:description"
          content={`Releases related to ${metadata?.properties.artist} - ${metadata?.properties.title}. \n Published on Nina.`}
        />
      </Head>
      <ReleaseRelated {...props} />
    </>
  );
};

export const getServerSideProps = async (context) => {
  const releasePubkey = context.params.releasePubkey;
  const metadataResult = await fetch(
    `${NinaClient.endpoints.api}/metadata/bulk`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [releasePubkey] }),
    }
  );
  const metadataJson = await metadataResult.json();
  return {
    props: {
      metadata: metadataJson[releasePubkey],
      releasePubkey,
    },
  };
};

export default Related;
