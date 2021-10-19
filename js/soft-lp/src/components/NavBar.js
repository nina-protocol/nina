import React, { useContext, useEffect, useState, useMemo } from 'react'
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router-dom'

import { useWallet } from '@solana/wallet-adapter-react'
import {
  WalletDialogProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-material-ui'
import softLpLogo from '../assets/soft-lp-logo.png'
import ninaCommon from 'nina-common'
import SlpControls from './SlpControls'

const PREFIX = 'NavBar';

const classes = {
  nav: `${PREFIX}-nav`,
  nav__left: `${PREFIX}-nav__left`,
  nav__right: `${PREFIX}-nav__right`,
  nav__balance: `${PREFIX}-nav__balance`,
  nav__logo: `${PREFIX}-nav__logo`,
  logo: `${PREFIX}-logo`,
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
    justifyContent: 'flex-end',
    zIndex: '12',
    padding: '10px',
    marginBottom: '0.5rem',
    paddingRight: '0',
    position: 'absolute',
    top: '0',
    '&__link': {
      color: `${theme.palette.black}`,
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      padding: '0 1rem',
      '&--active': {
        textDecoration: 'underline !important',
      },
    },
  },

  [`& .${classes.nav__left}`]: {
    display: 'flex',
  },

  [`& .${classes.nav__right}`]: {
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },

  [`& .${classes.nav__balance}`]: {
    margin: 'auto',
    color: `${theme.palette.blue}`,
    fontSize: '10px',
  },

  [`& .${classes.nav__logo}`]: {
    height: '18px',
  },

  [`& .${classes.logo}`]: {
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translate(-50%, 0%)',
    paddingTop: '13px',
    height: '27px',
    zIndex: '10',
  },

  [`& .${classes.nav__button}`]: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '20px',
  },

  [`& .${classes.walletDialogProvider}`]: {
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
          background: `${theme.palette.white}`,
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
  },

  [`& .${classes.walletButtonWrapper}`]: {
    textTransform: 'capitalize',
    paddingRight: '20px',
    paddingLeft: '20px',
    '& img': {
      display: 'none',
    },
    '& .MuiButton-label:hover': {
      color: `${theme.palette.blue}`,
    },
  },

  [`& .${classes.connectionDot}`]: {
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
  }
}));

const { NinaContext } = ninaCommon.contexts
const releasePubkey = process.env.REACT_APP_RELEASE_PUBKEY

const NavBar = (props) => {

  const { location, setActiveIndex, activeIndex } = props
  const { collection } = useContext(NinaContext)
  const wallet = useWallet()
  const [amountHeld, setAmountHeld] = useState(collection[releasePubkey])

  const base58 = useMemo(
    () => wallet?.publicKey?.toBase58(),
    [wallet?.publicKey]
  )

  const walletDisplay = useMemo(() => {
    if (!wallet || !base58) return null
    return base58.slice(0, 4) + '..' + base58.slice(-4)
  }, [wallet, base58])

  useEffect(() => {
    setAmountHeld(collection[releasePubkey] || 0)
  }, [collection[releasePubkey]])

  return (
    <Root className={classes.nav}>
      <SlpControls
        releasePubkey={releasePubkey}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
      {location.pathname === '/about' && (
        <Link to="/">
          <img className={classes.logo} src={softLpLogo} />
        </Link>
      )}
      {location.pathname === '/' && (
        <Link to="/" onClick={() => setActiveIndex(0)}>
          <img className={classes.logo} src={softLpLogo} />
        </Link>
      )}

      <div className={classes.nav__right}>
        <span className={classes.nav__balance}>
          {wallet?.connected && `${amountHeld} SOFT`}
        </span>
        <div className={classes.nav__button}>
          <WalletDialogProvider
            className={classes.walletDialogProvider}
            featuredWallets={4}
          >
            <WalletMultiButton className={classes.walletButtonWrapper}>
              {wallet?.connected
                ? `${wallet.wallet.name} ${walletDisplay}`
                : 'Connect Wallet'}
            </WalletMultiButton>
          </WalletDialogProvider>
          <span
            className={`${classes.connectionDot} ${
              wallet?.connected ? 'connected' : ''
            }`}
          ></span>
        </div>
      </div>
    </Root>
  );
}

export default withRouter(NavBar)
