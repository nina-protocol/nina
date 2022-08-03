import createBreakpoints from "@mui/system/createTheme/createBreakpoints";

const breakpoints = createBreakpoints({});
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const colors = {
  purple: "#9999cc",
  purpleLight: "#bcb2bf",
  red: "#FF2828",
  orange: "rgba(244, 73, 73, 0.94)",
  green: "#66F523",
  white: "#ffffff",
  greyLight: "#E3E3E3",
  grey: "rgba(0, 0, 0, 0.2)",
  transparent: "#ffffff00",
  overlay: "#574a4ac4",
  black: "#000000",
  blue: "#2D81FF",
};

const lightThemeOptions = {
  palette: {
    secondary: {
      main: "#9999cc",
    },
    background: {
      default: colors.white,
    },
    text: {
      primary: colors.black,
    },
    transparent: colors.transparent,
    overlay: colors.overlay,
    blue: colors.blue,
    black: colors.black,
    purple: colors.purple,
    white: colors.white,
    red: colors.red,
    green: colors.green,
    grey: {
      primary: colors.grey,
    },
    greyLight: colors.greyLight,
  },
  typography: {
    fontFamily: ["Helvetica", "Arial", "sans-serif"].join(","),
    berthold: {
      fontFamily: ["BlockBE-Heavy"].join(","),
    },
    gutterBottom: {
      marginBottom: "15px !important",
    },
    h1: {
      fontSize: "36px !important",
      fontWeight: "400 !important",
      [breakpoints.down("md")]: {
        fontSize: "24px !important",
      },
    },
    h2: {
      fontSize: "25px !important",
      fontWeight: "400 !important",
    },
    h3: {
      fontSize: "20px !important",
      lineHeight: "23px !important",
      [breakpoints.down("md")]: {
        lineHeight: "23px !important",
        fontSize: "16px !important",
      },
    },
    h4: {
      fontSize: "18px !important",
      lineHeight: "20.7px !important",
      [breakpoints.down("md")]: {
        lineHeight: "23px !important",
        fontSize: "16px !important",
      },
    },
    body1: {
      fontSize: "14px !important",
      lineHeight: "16.1px !important",
    },
    body2: {
      fontSize: "12px !important",
      lineHeight: "13.8px !important",
    },
    subtitle1: {
      fontSize: "10px !important",
    },
  },
  helpers: {
    grid: {
      display: "grid",
      gridAutoRows: "1fr",
      justifyContent: "center",
      alignContent: "center",
      justifyItems: "center",
      gridColumnGap: `10px`,
      gridRowGap: `10px`,
    },
    baseFont: {
      fontSize: "12px !important",
      lineHeight: "13.8px !important",
    },
    gradient: {
      background: `radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(143,175,223,1) 0%, rgb(35,99,196) 100%)`,
      color: colors.white,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          padding: "10px",
          fontSize: "14px",
          boxShadow: "none",
          minWidth: "unset !important",
          textTransform: "none",
          "&:hover": {
            backgroundColor: `${colors.transparent}`,
            boxShadow: "none",
          },
          "&.MuiButton-outlined": {
            borderRadius: "0px",
            padding: "20px",
            border: `1px solid ${colors.black}`,
            color: colors.black,
            height: "50px",
            "&.Mui-disabled": {
              border: `1px solid ${colors.grey}`,
              color: `${colors.grey} !important`,
            },
          },
          "&.MuiButton-contained": {
            padding: "0px",
            borderRadius: "0px",
            backgroundColor: `${colors.transparent}`,
            color: `${colors.black}`,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: `${colors.transparent}`,
              boxShadow: "none",
            },
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "black",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "black !important",
          padding: "0",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          backgroundColor: colors.black,
        },
        track: {
          backgroundColor: colors.black,
          borderColor: colors.black,
        },
        rail: {
          backgroundColor: colors.black,
        },
        root: {
          '& .MuiSlider-thumb': {
            color: colors.black,
            width: '14px',
            height: '11px',
            boxShadow: 'none !important',
            '&:hover': {
              boxShadow: 'none',
            },
            '& .Mui-focusVisible': {
              boxShadow: 'none',
            },
          },
          '& .MuiSlider-track': {
            color: colors.black,
            height: '1px',
            border: 'none',
          },
          '& .MuiSlider-rail': {
            color: colors.black,
            height: '1px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputLabel-root.Mui-focused": {
            color: "rgba(0,0,0,0.6)",
          },
          "& .MuiInputBase-root-MuiInput-root:after": {
            borderBottom: `2px solid rgba(0,0,0,0.6)`,
          },
          "& .MuiInput-underline:after": {
            borderBottom: `2px solid rgba(0,0,0,0.6) !important`,
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        a: {
          color: colors.black,
          cursor: "pointer !important",
          "&:hover": {
            opacity: "50% !important",
          },
        },
        'a, p, h1, h2, h3, h4, h4, h5, h6, figure, blockquote, dl, dd': {
          margin: '8px 0'
        },
        '.ql-toolbar': { // QL classes are for overriding Quill components
          textAlign: 'left'
        },
        '.ql-bubble a::before, a::after': {
          display: 'none'      
        },
        ".formField": {
          marginBottom: "8px !important",
          width: "100%",
          textTransform: "capitalize",
          position: "relative",
          fontSize: "12px !important",
          lineHeight: "13.8px !important",
          "& input, textarea": {
            textAlign: "left",
            "&::placeholder": {
              color: colors.red,
            },
          },
        },
        "#wallet-menu": {
          "&.MuiPopover-root": {
            backgroundColor: `${colors.transparent}`,
          },
          "& .MuiPopover-paper": {
            overflowX: " visible",
          },
          "& .MuiPaper-root": {
            backgroundColor: `${colors.transparent}`,
            background: `${colors.white}`,
            top: "40px !important",
            right: "24px !important",
            boxShadow: "none",
            overflowX: "visible",
            left: "unset !important",
          },
          "& li button": {
            display: "none",
          },
          "& .MuiListItem-root": {
            justifyContent: "flex-end",
            fontSize: "10px",
            paddingTop: "0px",
            paddingBottom: "0px",
            border: "2px solid red",
            "&:hover": {
              backgroundColor: `${colors.white}`,
              color: `${colors.blue}`,
            },
          },
          "& .MuiListItemIcon-root": {
            display: "none",
          },
        },
      },
    },
  },
};

const DashboardWrapper = styled(Grid)(() => ({
  textAlign: "left",
  height: "75%",
  overflow: "hidden",
  margin: " 0 auto",
  display: "flex",
  [breakpoints.down("md")]: {
    width: "100%",
    margin: "80px 15px 0",
    display: "block",
  },
}));

const DashboardContent = styled(Grid)(() => ({
  textAlign: "left",
  height: "100%",
  position: "relative",
  "& ul": {
    padding: "12px 0px 50px",
    overflowY: "scroll",
    height: "100%",
    [breakpoints.down("md")]: {
      height: "unset",
    },
  },
}));

const DashboardHeader = styled(Typography)(() => ({
  position: "absolute",
  top: "0",
}));

const DashboardEntry = styled("li")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  borderBottom: "1px solid black",
  padding: "5px 0",
  cursor: "pointer",
  height: "34px",
  maxWidth: "480px",
  "& a": {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    textDecoration: "none",
  },
  "& svg": {
    cursor: "pointer",
    "&:hover": {
      opacity: "50%",
    },
  },
}));

export {
  lightThemeOptions,
  DashboardWrapper,
  DashboardContent,
  DashboardHeader,
  DashboardEntry,
};
