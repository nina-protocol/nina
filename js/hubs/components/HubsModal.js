import React, { useState, useContext, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Link from "next/link";
import Hub from "@nina-protocol/nina-internal-sdk/esm/Hub";

const HubsModal = (props) => {
  const { releasePubkey, metadata } = props;
  const { getHubsForRelease, hubContentState, filterHubsForRelease } =
    useContext(Hub.Context);
  const [open, setOpen] = useState(false);
  const [hubs, setHubs] = useState([]);

  useEffect(() => {
    getHubsForRelease(releasePubkey);
  }, []);

  useEffect(() => {
    setHubs(filterHubsForRelease(releasePubkey));
  }, [hubContentState]);

  return (
    <Box>
      <Cta
        onClick={() => setOpen(true)}
        variant="body2"
        align="left"
        paddingBottom="10px"
      >
        {`View Hubs ${hubs ? `(${hubs.length})` : ""}`}
      </Cta>
      <StyledModal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <StyledPaper>
          <Header>
            <Typography fontWeight="700">{`Hubs featuring: ${metadata.properties.artist.substring(
              0,
              100
            )} - "${metadata.properties.title.substring(0, 100)}"`}</Typography>
          </Header>
          <CollectorTable>
            <TableBody>
              {hubs &&
                hubs.map((entry, i) => {
                  return (
                    <tr key={i}>
                      <td>
                        <Link
                          href={`/${entry?.handle}`}
                          className={
                            entry?.publishedThroughHub ? "publishingHub" : ""
                          }
                        >
                          {entry?.data.displayName}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </TableBody>
          </CollectorTable>
        </StyledPaper>
      </StyledModal>
    </Box>
  );
};

const PREFIX = "ExchangeHistoryModal";

const classes = {
  exchangeHistoryCta: `${PREFIX}-exchangeHistoryCta`,
  modal: `${PREFIX}-modal`,
  paper: `${PREFIX}-paper`,
  header: `${PREFIX}-header`,
  historyTable: `${PREFIX}-historyTable`,
  historyTableBody: `${PREFIX}-historyTableBody`,
};

const Cta = styled(Typography)(({ theme }) => ({
  cursor: "pointer",
  width: "min-content",
  whiteSpace: "nowrap",
  ":hover": {
    opacity: 0.5,
  },
}));

const StyledModal = styled(Modal)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "a:hover": {
    opacity: 0.5,
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(6, 4),
  ...theme.gradient,
  zIndex: "10",
}));

const Header = styled(Typography)(({ theme }) => ({
  fontSize: "26px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  fontWeight: "700",
  lineHeight: "29.9px",
  color: theme.palette.text.primary,
}));

const CollectorTable = styled("table")(({ theme }) => ({
  padding: `${theme.spacing(1, 1)}`,
  display: "block",
  maxHeight: "50vh",
  overflowY: "scroll",
  color: theme.palette.text.primary,
  [theme.breakpoints.down("md")]: {
    width: "80vw",
  },
  "& th": {
    textTransform: "uppercase",
  },
}));

const TableBody = styled("tbody")(({ theme }) => ({
  "& td": {
    "& ": {
      padding: `${theme.spacing(0, 2)}`,
    },
    "& a": {
      color: `${theme.palette.text.primary}`,
      whiteSpace: "nowrap",
      textDecoration: "none",
    },
  },
}));

export default HubsModal;
