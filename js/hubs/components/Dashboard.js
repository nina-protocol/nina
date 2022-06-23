import React, { useState, useContext, useMemo, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Typography from "@mui/material/Typography";
import nina from "@nina-protocol/nina-sdk";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useRouter } from "next/router";

import Grid from "@mui/material/Grid";
import ReleaseCreateViaHub from "./ReleaseCreateViaHub";
import HubOverview from "./HubOverview";
import HubCreate from "./HubCreate";
import BundlrModal from "./BundlrModal";
import HubPosts from "./HubPosts";
import HubCollaborators from "./HubCollaborators";
import HubReleases from "./HubReleases";

const { HubContext } = nina.contexts;

const toTitleCase = (text) => {
  // Add to sdk
  return text.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
};

const Dashboard = ({ hubPubkey }) => {
  const wallet = useWallet();
  const router = useRouter();
  const { getHub, hubState, hubCollaboratorsState, hubContentState } =
    useContext(HubContext);

  const actions = [
    "hubOverview",
    "releases",
    "posts",
    "collaborators",
    "updateHubInfo",
    "publishRelease",
  ];

  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey]);
  const hubCollaborators = useMemo(
    () => hubCollaboratorsState,
    [hubCollaboratorsState]
  );
  const hubContent = useMemo(() => hubContentState, [hubContentState]);
  const isAuthority = useMemo(
    () =>
      wallet?.publicKey && wallet?.publicKey?.toBase58() === hubData?.authority,
    [hubData, wallet]
  );
  const [activeAction, setActiveAction] = useState(
    router.query.action ? `${actions.indexOf(router.query.action)}` : "0"
  );
  const canAddContent = useMemo(() => {
    const hubCollaboratorForWallet = Object.values(hubCollaborators)?.filter(
      (hubCollaborator) =>
        hubCollaborator.collaborator === wallet?.publicKey?.toBase58()
    )[0];
    if (
      hubCollaboratorForWallet &&
      hubCollaboratorForWallet.canAddContent &&
      hubCollaboratorForWallet.allowance > 0
    ) {
      return true;
    }
    if (wallet?.publicKey?.toBase58() === hubData?.authority) {
      return true;
    }
    return false;
  }, [hubCollaborators, hubData, wallet]);

  const canAddCollaborators = useMemo(() => {
    const hubCollaboratorForWallet = Object.values(hubCollaborators)?.filter(
      (hubCollaborator) =>
        hubCollaborator.collaborator === wallet?.publicKey?.toBase58()
    )[0];

    if (
      hubCollaboratorForWallet &&
      hubCollaboratorForWallet.canAddCollaborator &&
      hubCollaboratorForWallet.allowance > 0
    ) {
      return true;
    }
    if (wallet?.publicKey?.toBase58() === hubData?.authority) {
      return true;
    }
    return false;
  }, [hubCollaborators, hubData, wallet]);

  useEffect(() => {
    if (hubPubkey) {
      getHub(hubPubkey);
    }
  }, [hubPubkey]);

  useEffect(() => {
    if (router.query.action) {
      const index = actions.indexOf(router.query.action);
      setActiveAction(index.toString());
    } else {
      setActiveAction("0");
    }
  }, [router.query.action]);

  useEffect(() => {
    if (wallet.disconnecting) {
      router.push("/");
    }
  }, [wallet?.disconnecting]);

  const handleSelectAction = (e) => {
    const index = e.target.getAttribute("data-index");
    if (index !== "0") {
      const actionParam = actions[index];
      router.push(`/${hubData.handle}/dashboard?action=` + actionParam);
    } else {
      router.push(`/${hubData.handle}/dashboard`);
    }
    setActiveAction(index);
  };

  const renderAction = (activeAction) => {
    switch (activeAction) {
      case "0":
        return (
          <HubOverview
            hubPubkey={hubPubkey}
            hubContent={hubContent}
            isAuthority={isAuthority}
          />
        );
      case "1":
        return (
          <HubReleases
            type="releases"
            hubPubkey={hubPubkey}
            hubContent={hubContent}
            isAuthority={isAuthority}
            canAddContent={canAddContent}
          />
        );
      case "2":
        return (
          <HubPosts
            hubPubkey={hubPubkey}
            hubContent={hubContent}
            hubData={hubData}
            canAddContent={canAddContent}
          />
        );
      case "3":
        return (
          <HubCollaborators
            hubPubkey={hubPubkey}
            isAuthority={isAuthority}
            authority={hubData?.authority}
            canAddCollaborators={canAddCollaborators}
          />
        );
      case "4":
        return (
          <HubCreate update={true} hubPubkey={hubPubkey} hubData={hubData} />
        );
      case "5":
        return (
          <ReleaseCreateViaHub
            canAddContent={canAddContent}
            hubPubkey={hubPubkey}
          />
        );
      default:
        break;
    }
  };

  return (
    <>
      {wallet?.connected && hubData && (
        <>
          <Grid item md={0}>
            <ActionsList>
              {actions.map((action, i) => {
                switch (action) {
                  case "publishRelease":
                    return;

                  case "updateHubInfo":
                    return isAuthority ? (
                      <li key={i} data-index={i}>
                        <Typography
                          data-index={i}
                          onClick={(e) => handleSelectAction(e)}
                        >
                          {toTitleCase(action)}
                        </Typography>
                      </li>
                    ) : (
                      ""
                    );

                  default:
                    return (
                      <li key={i} data-index={i}>
                        <Typography
                          data-index={i}
                          onClick={(e) => handleSelectAction(e)}
                        >
                          {toTitleCase(action)}
                        </Typography>
                      </li>
                    );
                }
              })}
              <li>
                <BundlrModal inCreate={false} />
              </li>
            </ActionsList>
          </Grid>

          <Grid
            item
            md={12}
            xs={12}
            height="100%"
            sx={{ width: { xs: "100%" } }}
          >
            <ActionWrapper activeAction={activeAction}>
              {renderAction(activeAction)}
            </ActionWrapper>
          </Grid>
        </>
      )}
    </>
  );
};

const ActionWrapper = styled(Box)(({ theme }) => ({
  height: "100%",
  maxHeight: "100%",
  width: "100%",
  display: "flex",
  alignItems: `flex-start`,
  padding: "0px 15px 15px",
  overflowY: "scroll",
  [theme.breakpoints.down("md")]: {
    padding: "0",
  },
}));

const ActionsList = styled("ul")(({ theme }) => ({
  textAlign: "left",
  marginTop: "0px",
  paddingLeft: "15px",
  listStyle: "none",
  position: "absolute",
  left: "0",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
  "& li": {
    cursor: "pointer",
    width: "min-content",
    whiteSpace: "nowrap",
    "&:hover": {
      opacity: "50%",
    },
  },
}));

export default Dashboard;
