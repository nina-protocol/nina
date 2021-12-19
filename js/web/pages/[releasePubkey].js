import * as anchor from '@project-serum/anchor'
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import Release from "../components/Release";
import ninaCommon from 'nina-common'
const {NinaClient} = ninaCommon.utils

const ReleasePage = (props) => {
  return <Release metadata={props.metadata}/>;
};

export const getServerSideProps = async (context) => {
  const releasePubkey = context.params.releasePubkey
  const metadataResult = await fetch(
    `${NinaClient.endpoints.api}/metadata/bulk`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [releasePubkey] }),
    } 
  )
  const metadataJson = await metadataResult.json()

  return {
    props: {
      metadata: metadataJson[releasePubkey]
    }
  }
}

export default ReleasePage;
