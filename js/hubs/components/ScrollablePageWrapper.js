import React from "react";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

const ScrollablePageWrapper = ({ onScroll, children }) => {
  return <ScrollablePage onScroll={onScroll}>{children}</ScrollablePage>;
};

const ScrollablePage = styled(Box)(({ theme }) => ({
  width: "100vw",
  padding: "0",
  overflowY: "scroll",
  overflowX: "hidden",
  [theme.breakpoints.down("md")]: {
    width: "100vw",
    padding: "100px 0px",
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
      display: "none !important",
    },
  },
}));

export default ScrollablePageWrapper;
