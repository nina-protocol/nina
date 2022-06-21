import React from "react";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

const ScrollablePageWrapper = ({ onScroll, children }) => {
  return <ScrollablePage onScroll={onScroll}>{children}</ScrollablePage>;
};

const ScrollablePage = styled(Box)(({ theme }) => ({
  width: "100vw",
<<<<<<< HEAD
  padding: "0",
=======
  padding: "210px 0",
>>>>>>> fd4bebc686d1a12e3480b9f1a5f9f3ab39feb432
  overflowY: "scroll",
  overflowX: "hidden",
  [theme.breakpoints.down("md")]: {
    width: "100vw",
    padding: "100px 0px",
    overflowY: "scroll",
<<<<<<< HEAD
    "&::-webkit-scrollbar": {
      display: "none !important",
    },
=======
>>>>>>> fd4bebc686d1a12e3480b9f1a5f9f3ab39feb432
  },
}));

export default ScrollablePageWrapper;
