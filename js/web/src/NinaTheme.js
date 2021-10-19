import { createTheme, adaptV4Theme } from '@mui/material/styles';

const colors = {
  purple: '#9999cc',
  purpleLight: '#bcb2bf',
  red: '#E05132',
  orange: 'rgba(244, 73, 73, 0.94)',
  green: '#32b36c',
  white: '#ffffff',
  greyLight: 'rgba(0, 0, 0, 0.2)',
  grey: 'rgba(0, 0, 0, 0.3)',
  transparent: '#ffffff00',
  black: '#000000',
  blue: 'rgba(45, 129, 255, 1)',
  blueTrans: 'rgba(45, 129, 255, 0.19)',
  pink: '#FF54A6',
}


export const NinaTheme = createTheme(adaptV4Theme({
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
    transparent: {
      main: colors.transparent
    },
    blue: {
      main: colors.blue
    },
    black: {
      main: colors.black
    },
    white: {
      main: colors.white
    }
  },
  gradient: {
    background: `radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(143,175,223,1) 0%, rgb(35,99,196) 100%)`,
    color: colors.white,
  },
  props: {
    MuiButtonBase: {
      disableRipple: true, // No more ripple, on the whole application!
    },
    MuiListItem: {
      disableRipple: true, // No more ripple, on the whole application!
    },
    MuiMenuItem: {
      disableRipple: true, // No more ripple, on the whole application!
    },
  },
  typography: {
    fontFamily: ['Helvetica', 'san-serif'].join(','),
    berthold: {
      fontFamily: ['BlockBE-Heavy'].join(','),
    },
  },
  vars: {
    purple: colors.purple,
    purpleLight: colors.purpleLight,
    pink: colors.pink,
    red: colors.red,
    orange: colors.orange,
    green: colors.green,
    white: colors.white,
    black: colors.black,
    blue: colors.blue,
    blueTrans: colors.blueTrans,
    transparent: colors.transparent,
    greyLight: colors.greyLight,
    grey: colors.grey,
    borderWidth: '1.5px',
    borderRadius: '16px',
  },
  transitions: {
    easing: {
      easeOut: 'cubic-bezier(0, 1.5, .8, 1)',
      sharp: 'linear',
    },
  },
  spacing: 10,
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
    inputLabelPair: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '0.2rem 0',
    },
    input: {
      width: '60%',
    },
    gradient: {
      // background: colors.blue,
      background: `radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(143,175,223,1) 0%, rgb(35,99,196) 100%)`,
      color: colors.white,
    },
  },
  overrides: {
    MuiButton: {
      root: {
        padding: '10px',
        fontSize: '10px',
        '&.MuiButton-outlined': {
          borderRadius: '50px',
          padding: '10px',
          '&:hover': {
            borderColor: `${colors.blue}`,
          },
        },
        '&.MuiButton-contained': {
          borderRadius: '50px',
          padding: '10px',
          backgroundColor: `${colors.white}`,
          color: `${colors.black}`,
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: `${colors.white}`,
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTypography: {
      root: {
        letterSpacing: '0.02em',
      },
    },
    MuiCssBaseline: {
      '@global': {
        '*, *::before, *::after': {
          boxSizing: 'content-box',
        },
        body: {
          overflow: 'hidden',
          },
        a: {
          color: colors.black,
          textDecoration: 'none',
          '&:hover': {
            color: colors.blue,
          },
        },
        '#wallet-menu': {
          '& .MuiPopover-paper': {
            overflowX: ' visible',
          },
          '& .MuiPaper-root': {
            backgroundColor: `${colors.white}`,
            top: '40px !important',
            right: '24px !important',
            boxShadow: 'none',
            overflowX: 'visible',
            left: 'unset !important',
          },
          '& li button': {
            display: 'none',
          },
          '& .MuiListItem-root': {
            justifyContent: 'flex-end',
            fontSize: '10px',
            paddingTop: '0px',
            paddingBottom: '0px',
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
    MuiSlider: {
      thumb: {
        color: `${colors.purple}`,
      },
      track: {
        color: `${colors.purple}`,
      },
      rail: {
        color: `${colors.purpleLight}`,
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
}))
