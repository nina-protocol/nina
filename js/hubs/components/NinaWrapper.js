import React from "react";
import {Provider as AudioContextProvider} from "@nina-protocol/nina-sdk/esm/Audio";
import {Provider as ReleaseContextProvider} from "@nina-protocol/nina-sdk/esm/Release";
import Hub from "@nina-protocol/nina-sdk/esm/Hub";
import {Provider as NinaContextProvider} from "@nina-protocol/nina-sdk/esm/Nina";
import NinaClient from "@nina-protocol/nina-sdk/esm/client"
import { AnchorProvider } from "@project-serum/anchor";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
const NinaWrapper = ({ children, network }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'processed',
  })

  const ninaClient = NinaClient(provider, network);
  return (
    <NinaContextProvider ninaClient={ninaClient}>
      <ReleaseContextProvider>
        <AudioContextProvider>
          <Hub.Provider>{children}</Hub.Provider>
        </AudioContextProvider>
      </ReleaseContextProvider>
    </NinaContextProvider>
  );
};

export default NinaWrapper;
