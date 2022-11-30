import React from "react";
import Audio from "@nina-protocol/nina-internal-sdk/esm/Audio";
import Release from "@nina-protocol/nina-internal-sdk/esm/Release";
import Hub from "@nina-protocol/nina-internal-sdk/esm/Hub";
import Nina from "@nina-protocol/nina-internal-sdk/esm/Nina";
import NinaClient from "@nina-protocol/nina-internal-sdk/esm/client";
import { AnchorProvider } from "@project-serum/anchor";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
const NinaWrapper = ({ children, network }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "processed",
  });

  const ninaClient = NinaClient(provider, network);
  console.log("ninaClient !!!:>> ", ninaClient);
  return (
    <Nina.Provider ninaClient={ninaClient}>
      <Release.Provider>
        <Audio.Provider>
          <Hub.Provider>{children}</Hub.Provider>
        </Audio.Provider>
      </Release.Provider>
    </Nina.Provider>
  );
};

export default NinaWrapper;
