import React, { useState, useContext, useEffect } from "react";
import { styled } from "@mui/material/styles";
import ninaCommon from "nina-common";
import { useWallet } from "@solana/wallet-adapter-react";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import { Typography, Box } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Link from "next/link";
import { Icon } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import { faInstagramSquare } from "@fortawesome/free-brands-svg-icons";
import CloseIcon from "@mui/icons-material/Close";
import Image from 'next/image'

const { NinaContext, ReleaseContext } = ninaCommon.contexts;

const linksConnected = [
  "home",
  "all Releases",
  "collection",
  "releases",
  "upload",
  "faq",
  "the soft lp",
];

const linksNotConnected = [
  "home",
  "all Releases",
  "upload",
  "faq",
  "the soft lp",
];

const NavDrawer = () => {
  const { collection } = useContext(NinaContext);
  const wallet = useWallet();
  const {
    releaseState,
    getReleasesPublishedByUser,
    filterReleasesPublishedByUser,
    filterReleasesUserCollection,
  } = useContext(ReleaseContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userPublishedReleasesCount, setUserPublishedReleasesCount] =
    useState();
  const [userCollectionReleasesCount, setUserCollectionReleasesCount] =
    useState();
  const [links, setLinks] = useState(linksNotConnected);

  useEffect(() => {
    if (wallet?.connected) {
      setLinks(linksConnected);
      getReleasesPublishedByUser(wallet.publicKey);
    } else {
      setLinks(linksNotConnected);
    }
  }, [wallet?.connected]);

  useEffect(() => {
    if (wallet?.connected) {
      setUserPublishedReleasesCount(filterReleasesPublishedByUser().length);
      setUserCollectionReleasesCount(filterReleasesUserCollection().length);
    }
  }, [releaseState, collection]);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const list = () => (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <CloseIcon
        fontSize="large"
        onClick={toggleDrawer}
        sx={{ padding: "15px 15px" }}
      />
      <StyledList disablePadding>
        {links.map((link) => {
          switch (link) {
            case "collection":
              return (
                <Link
                  className={`${classes.drawerLink}`}
                  href={`/${link}`}
                  activeClassName={`${classes.drawerLink} ${classes.drawerLink}--active  `}
                  key={link}
                  passHref
                >
                  <ListItem button key={link}>
                    <ListItemText
                      primary={`your ${link}  ${
                        userCollectionReleasesCount
                          ? `(${userCollectionReleasesCount})`
                          : ""
                      }`}
                    />
                  </ListItem>
                </Link>
              );
            case "releases":
              return (
                <Link
                  className={`${classes.drawerLink}`}
                  href={`/releases/user`}
                  activeClassName={`${classes.drawerLink} ${classes.drawerLink}--active  `}
                  key={link}
                  passHref
                >
                  <ListItem button key={link}>
                    <ListItemText
                      primary={`your ${link}  ${
                        userPublishedReleasesCount
                          ? `(${userPublishedReleasesCount})`
                          : ""
                      }`}
                    />
                  </ListItem>
                </Link>
              );
            case "the soft lp":
              return (
                <ListItem button key={link}>
                  <ListItemText>
                    <Link
                      href="https://softlp.nina.market"
                      target="_blank"
                      rel="noreferrer"
                      className={`${classes.drawerLink}`}
                      passHref
                    >
                      The Soft LP
                    </Link>
                  </ListItemText>
                </ListItem>
              );
            case "all Releases":
              return (
                <Link
                  className={`${classes.drawerLink}`}
                  href={`/releases`}
                  activeClassName={`${classes.drawerLink} ${classes.drawerLink}--active  `}
                  key={link}
                  passHref
                >
                  <ListItem button key={link}>
                    <ListItemText primary="All Releases" />
                  </ListItem>
                </Link>
              );

            default:
              return (
                <Link
                  className={`${classes.drawerLink}`}
                  href={`${
                    link === "home" ? "/" : `/${link.replace(" ", "")}`
                  }`}
                  activeClassName={`${classes.drawerLink} ${classes.drawerLink}--active  `}
                  key={link}
                  passHref
                >
                  <ListItem button key={link}>
                    <ListItemText primary={link} />
                  </ListItem>
                </Link>
              );
          }
        })}
      </StyledList>
    </Box>
  );

  return (
    <div>
      {
        <Box key={"left"}>
          <StyledMenuButton onClick={toggleDrawer(true)}>
            <Icon>
              <Image src={"/hamburger.svg"} height={25} width={25} />
            </Icon>
          </StyledMenuButton>
          <StyledDrawer
            anchor={"left"}
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            BackdropProps={{ invisible: true }}
          >
            {list()}

            <DrawerFooter>
              <Box>
                <a
                  href="https://twitter.com/nina_market_"
                  target="_blank"
                  rel="noreferrer"
                  style={{ paddingRight: "15px" }}
                >
                  <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a
                  href="https://discord.gg/ePkqJqSBgj"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon icon={faDiscord} />
                </a>
                <a
                  href="https://www.instagram.com/nina_market__/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon icon={faInstagramSquare} />
                </a>
              </Box>

              <Typography variant="subtitle1">
                © 2021 Nina Protocol Corp
              </Typography>
            </DrawerFooter>
          </StyledDrawer>
        </Box>
      }
    </div>
  );
};

const PREFIX = "NavDrawer";

const classes = {
  toggle: `${PREFIX}-toggle`,
  list: `${PREFIX}-list`,
  drawerLink: `${PREFIX}-drawerLink`,
};

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiPaper-root": {
    width: 436,
    [theme.breakpoints.down("md")]: {
      width: "100vw",
    },
  },
}));

const StyledList = styled(List)(({ theme }) => ({
  padding: `${theme.spacing("100px", 4, 0, 4)} !important`,
  "& .MuiListItem-root": {
    padding: "5px 0",
    "&:hover": {
      backgroundColor: theme.palette.transparent,
    },
    "& .MuiListItemText-root": {
      margin: 0,
      "& span": {
        textTransform: "capitalize",
        fontSize: "18px !important",
        lineHeight: "20.7px !important",
      },
    },
  },
}));

const StyledMenuButton = styled(Button)(({ theme }) => ({
  padding: "0px !important",
  zIndex: "10",
  "&:hover": {
    backgroundColor: `${theme.palette.transparent} !important`,
  },
  "& .MuiSvgIcon-root": {
    color: theme.palette.black,
  },
}));

const DrawerFooter = styled(Box)(() => ({
  position: "absolute",
  bottom: "10px",
  width: "75%",
  left: "60px",
  transform: "translateY(-50%)",
  display: "flex",
  justifyContent: "space-between",
  "& a": {
    paddingRight: "15px",
  },
}));

export default NavDrawer;
