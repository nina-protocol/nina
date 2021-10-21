import React, { useContext, useMemo } from 'react'
import { styled } from '@mui/material/styles';
import ninaCommon from 'nina-common'
import NavDrawer from './NavDrawer'
import { withFormik } from 'formik'
import { NavLink } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  WalletDialogProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-material-ui'
import ninaLogo from '../assets/nina-logo-black.png'

const { NinaContext } = ninaCommon.contexts

const NavBar = () => {

  const { usdcBalance } = useContext(NinaContext)
  // const {
  //   lookupUserTwitterHandle,
  //   userTwitterHandle,
  // } = useContext(NameContext)
  const wallet = useWallet()

  const base58 = useMemo(
    () => wallet?.publicKey?.toBase58(),
    [wallet?.publicKey]
  )

  // useEffect(() => {
  //   if (wallet?.connected) {
  //     lookupUserTwitterHandle()
  //   }
  // }, [wallet])

  const walletDisplay = useMemo(() => {
    if (!wallet || !base58) return null
    return base58.slice(0, 4) + '..' + base58.slice(-4)
  }, [wallet, base58])

  return (
    <Root className={classes.nav}>
      <div className={classes.nav__left}>
        <NavDrawer />
      </div>

      <NavLink
        to="/"
        activeClassName={`${classes.nav}__link ${classes.nav}__link--active  `}
      >
        <img src={ninaLogo} className={classes.nav__logo} alt="nina" />
      </NavLink>

      <div className={classes.nav__right}>
        <span className={classes.nav__balance}>
          {wallet?.connected ? `balance: $${usdcBalance}` : null}
        </span>
        <div className={classes.nav__button}>
          <StyledWalletDialogProvider featuredWallets={4}>
              <StyledWalletButton >
                {wallet?.connected
                  ? `${wallet.wallet.name} ${walletDisplay}`
                  : 'Connect Wallet'}
              </StyledWalletButton>
            <ConnectionDot
              className={`${classes.connectionDot} ${wallet?.connected ? 'connected' : ''
                }`}
            ></ConnectionDot>
            {/* {userTwitterHandle && 
              <a href={`https://twitter.com/${userTwitterHandle}`} target="_blank" rel="noreferrer">(@{userTwitterHandle})</a>
            } */}
          </StyledWalletDialogProvider>
        </div>
      </div>
    </Root>
  );
}

const PREFIX = 'NavBar';

const classes = {
  nav: `${PREFIX}-nav`,
  nav__left: `${PREFIX}-nav__left`,
  nav__right: `${PREFIX}-nav__right`,
  nav__balance: `${PREFIX}-nav__balance`,
  nav__logo: `${PREFIX}-nav__logo`,
  nav__button: `${PREFIX}-nav__button`,
  walletDialogProvider: `${PREFIX}-walletDialogProvider`,
  walletButtonWrapper: `${PREFIX}-walletButtonWrapper`,
  connectionDot: `${PREFIX}-connectionDot`
};

const Root = styled('nav')((
  {
    theme
  }
) => ({
  [`&.${classes.nav}`]: {
    background: `${theme.palette.transparent}`,
    height: '30px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    zIndex: '12',
    padding: '10px',
    marginBottom: '0.5rem',
    paddingRight: '0',
    position: 'absolute',
    top: '0',
  },

  [`& .${classes.nav__left}`]: {
    display: 'flex',
  },

  [`& .${classes.nav__right}`]: {
    display: 'flex',
    justifyContent: 'center',
  },

  [`& .${classes.nav__balance}`]: {
    margin: 'auto',
    color: `${theme.palette.blue}`,
    fontSize: '10px',
  },

  [`& .${classes.nav__logo}`]: {
    height: '150%',
  },

  [`& .${classes.nav__button}`]: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '24px',
    fontSize: '10px',
  },
}));

const StyledWalletDialogProvider = styled(WalletDialogProvider)(({theme}) => ({
  '& .MuiButton-root': {
    backgroundColor: `${theme.palette.white}`,
  },
  '& .MuiButton-startIcon': {
    display: 'none',
  },
  '& .MuiPaper-root': {
    width: '400px',
    height: '315px',
    ...theme.helpers.gradient,
    '& .MuiDialogTitle-root': {
      color: `${theme.palette.white}`,
      textAlign: 'center',
      padding: `${theme.spacing(6, 0, 0)}`,
      textTransform: 'uppercase',
      '& h2': {
        fontSize: '16px !important',
        fontWeight: '700',
      },
      '& .MuiButtonBase-root': {
        display: 'none',
      },
    },
    '& .MuiListItem-gutters': {
      padding: `${theme.spacing(0.5, 0)}`,
      '& .MuiButton-root': {
        width: '241px',
        margin: 'auto',
        backgroundColor: `${theme.palette.white}`,
        borderRadius: '50px',
        color: `${theme.palette.blue}`,
        fontSize: '14px',
        fontWeight: '700',
        '&:hover': {
          backgroundColor: `${theme.palette.blue}`,
          color: `${theme.palette.white}`,
        },
        '& .MuiButton-endIcon': {
          display: 'none',
        },
      },
    },
  },
}))

const StyledWalletButton = styled(WalletMultiButton)(({theme}) => ({
  textTransform: 'capitalize',
  paddingRight: '20px',
  paddingLeft: '20px',
  backgroundColor: `${theme.palette.transparent} !important`,
  boxShadow: 'none !important',
  '& img': {
    display: 'none',
  },
  '& .MuiButton-label': {
    color: `${theme.palette.black}`,
  },
  '& .MuiButton-label:hover': {
    color: `${theme.palette.blue}`,
  },
}))


const ConnectionDot = styled('span')(({theme}) => ({
  height: '8px',
  width: '8px',
  backgroundColor: `${theme.palette.blue}`,
  borderRadius: '50%',
  display: 'inline-block',
  opacity: '19%',
  marginLeft: '10px',
  '&.connected': {
    opacity: '100%',
  },
}))

export default withFormik({
  enableReinitialize: true,
  mapPropsToValues: () => {
    return {
      query: '',
    }
  },
})(NavBar)
