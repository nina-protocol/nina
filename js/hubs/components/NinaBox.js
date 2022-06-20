import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

const NinaBox = ({ children, columns, justifyItems, gridColumnGap }) => (
  <StyledBox
    columns={columns}
    justifyItems={justifyItems}
    gridColumnGap={gridColumnGap}
  >
    {children}
  </StyledBox>
);

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop,
})(({ theme, columns, justifyItems, gridColumnGap }) => ({
  ...theme.helpers.grid,
  justifyItems: justifyItems ? justifyItems : "center",
  width: "765px",
  minHeight: "547px",
  margin: "auto",
  gridTemplateColumns: columns ? columns : "repeat(2, 1fr)",
  gridColumnGap: gridColumnGap ? gridColumnGap : "0px",
  gridAutoRows: "auto",
  [theme.breakpoints.down("md")]: {
    width: "80vw",
    margin: "140px auto",
    display: "flex",
    flexDirection: "column",
  },
  [theme.breakpoints.down("sm")]: {
    margin: "0px auto",
  },
}));

export default NinaBox;
