import { createTheme } from '@mui/material/styles'
import createBreakpoints from '@mui/system/createTheme/createBreakpoints'

const breakpoints = createBreakpoints({})

const colors = {
  purple: '#9999cc',
  purpleLight: '#bcb2bf',
  red: '#FF2828',
  orange: 'rgba(244, 73, 73, 0.94)',
  green: '#66F523',
  white: '#ffffff',
  greyLight: '#E3E3E3',
  grey: 'rgba(0, 0, 0, 0.2)',
  transparent: '#ffffff00',
  lightTransparent: 'rgba(255,255,255,0.8)',
  overlay: '#574a4ac4',
  black: '#000000',
  blue: '#2D81FF',
  blueTrans: 'rgba(45, 129, 255, 0.19)',
  pink: '#FF54A6',
  yellow: '#ffe100',
  offWhite: '#faf9f9',
}

export const NinaTheme = createTheme({
  palette: {
    secondary: {
      main: '#9999cc',
    },
    background: {
      default: colors.white,
    },
    text: {
      primary: colors.black,
    },
    transparent: colors.transparent,
    lightTransparent: colors.lightTransparent,
    overlay: colors.overlay,
    blue: colors.blue,
    black: colors.black,
    purple: colors.purple,
    white: colors.white,
    red: colors.red,
    green: colors.green,
    yellow: colors.yellow,
    grey: {
      primary: colors.grey,
    },
    greyLight: colors.greyLight,
    offWhite: colors.offWhite,
  },
  gradient: {
    background: `radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(143,175,223,1) 0%, rgb(35,99,196) 100%)`,
    color: colors.white,
  },
  typography: {
    fontFamily: ['Helvetica', 'Arial', 'sans-serif'].join(','),
    berthold: {
      fontFamily: ['BlockBE-Heavy'].join(','),
    },
    gutterBottom: {
      marginBottom: '15px !important',
    },
    h1: {
      fontSize: '36px !important',
      fontWeight: '400 !important',
      [breakpoints.down('md')]: {
        fontSize: '24px !important',
      },
    },
    h2: {
      fontSize: '25px !important',
      fontWeight: '400 !important',
    },
    h3: {
      fontSize: '20px !important',
      lineHeight: '23px !important',
      [breakpoints.down('md')]: {
        lineHeight: '23px !important',
        fontSize: '16px !important',
      },
    },
    h4: {
      fontSize: '18px !important',
      lineHeight: '20.7px !important',
      [breakpoints.down('md')]: {
        lineHeight: '23px !important',
        fontSize: '16px !important',
      },
    },
    body1: {
      fontSize: '14px !important',
      lineHeight: '16.1px !important',
    },
    body2: {
      fontSize: '12px !important',
      lineHeight: '13.8px !important',
    },
    subtitle1: {
      fontSize: '10px !important',
    },
  },
  // transitions: {
  //   easing: {
  //     easeOut: 'cubic-bezier(0, 1.5, .8, 1)',
  //     sharp: 'linear',
  //   },
  // },
  spacing: 15,
  maxWidth:'960px',
  helpers: {
    grid: {
      display: 'grid',
      gridAutoRows: '1fr',
      justifyContent: 'center',
      alignContent: 'center',
      justifyItems: 'center',
      gridColumnGap: `10px`,
      gridRowGap: `10px`,
    },
    flexColumn: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    gradient: {
      background: `radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(143,175,223,1) 0%, rgb(35,99,196) 100%)`,
      color: colors.white,
    },
    inputShadow: {
      boxShadow: '0px 0px 30px 0px #0000001A',
    },
    baseFont: {
      fontSize: '12px !important',
      lineHeight: '13.8px !important',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          padding: '10px',
          fontSize: '10px',
          boxShadow: 'none',
          minWidth: 'unset !important',
          '&:hover': {
            backgroundColor: `${colors.transparent} !important`,
            opacity: 0.5,
          },
          '&.MuiButton-outlined': {
            borderRadius: '0px',
            padding: '20px',
            borderColor: colors.black,
            color: colors.black,
            maxHeight: "55px",
            '&.Mui-disabled': {
              border: `1px solid ${colors.grey}`,
              color: colors.grey,
            },
            '&:hover': {
              borderColor: colors.black,
              color: colors.black,
            },
          },
          '&.MuiButton-contained': {
            padding: '10px',
            borderRadius: '0px',
            backgroundColor: `${colors.transparent}`,
            color: `${colors.black}`,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: `${colors.white}`,
              boxShadow: 'none',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: '0px !important',
          boxShadow: 'none',
          minWidth: 'unset !important',
          opacity: 100,
          color: `${colors.black}`,
          '&:hover': {
            backgroundColor: `${colors.white} !important`,
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        root: {
          background: colors.transparent,
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          cursor: 'pointer',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          outline: '0'
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          letterSpacing: '0.02em !important',
        },
      },
    },
    MuiListItem: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInput-underline:before': {
            borderBottom: `1px solid ${colors.black}`,
          },
          '& .MuiInput-underline:after': {
            borderBottom: `1px solid ${colors.black}`,
          },
          '& .MuiFormControl-root': {
            height: '35px',
          },
          '& .MuiFormLabel-root.Mui-focused': {
            color: 'rgba(0, 0, 0, 0.54)',
          },
          '& .MuiInputLabel-formControl': {
            transform: 'translate(0, 15px) scale(1)',
            fontSize: '12px',
          },
          '& .MuiInputLabel-shrink': {
            transform: 'translate(0, 1.5px) scale(.75)',
          },
          '& input[type=number]::-webkit-inner-spin-button': {
            '-webkit-appearance': 'none',
            margin: '0',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
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
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': {
          boxSizing: 'content-box',
        },
        'a, p, h1, h2, h3, h4, h5, h6. figure, blockquote, dl, dd': {
          margin: '8px 0'
        },
        '.ql-toolbar': { // QL classes are for overriding Quill components
          textAlign: 'left'
        },
        '.ql-bubble a::before, a::after': {
          display: 'none'
        },
        body: {
          overflow: 'hidden',
        },
        a: {
          color: colors.black,
          textDecoration: 'none',
          cursor: 'pointer !important',
          '&:hover': {
            opacity: 0.5,
          },
        },
        '#wallet-menu': {
          '&.MuiPopover-root': {
            backgroundColor: `${colors.transparent}`,
          },
          '& .MuiPopover-paper': {
            overflowX: ' visible',
          },
          '& .MuiPaper-root': {
            backgroundColor: `${colors.transparent}`,
            top: '40px !important',
            right: '24px !important',
            boxShadow: 'none',
            overflowX: 'visible',
            left: 'unset !important',
          },
          '& li button': {
            display: 'none',
          },
          '& li': {
            justifyContent: 'flex-end',
            fontSize: '10px',
            padding: '0 16px',
            fontSize: '10px !important',
            '&:hover': {
              backgroundColor: `${colors.white}`,
              color: `${colors.blue}`,
            },
          },
          '& .MuiListItemIcon-root': {
            display: 'none',
          },
        },
      },
    },
    MuiTabs: {
      flexContainer: {
        justifyContent: 'center',
      },
    },
    MuiTooltip: {
      tooltip: {
        fontSize: '0.75rem',
      },
    },
  },
})
