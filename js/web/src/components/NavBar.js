import React, { useContext, useMemo, useEffect } from 'react'
import ninaCommon from 'nina-common'
import { withFormik } from 'formik'
import { NavLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  WalletDialogProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-material-ui'
import ninaLogo from '../assets/nina-logo-black.png'

const { NinaContext, NameContext } = ninaCommon.contexts

const NavBar = () => {
  const classes = useStyles()
  const { usdcBalance } = useContext(NinaContext)
  const {
    lookupUserTwitterHandle,
    userTwitterHandle,
  } = useContext(NameContext)
  const wallet = useWallet()

  const base58 = useMemo(
    () => wallet?.publicKey?.toBase58(),
    [wallet?.publicKey]
  )

  useEffect(() => {
    if (wallet?.connected) {
      lookupUserTwitterHandle()
    }
  }, [wallet])


  const walletDisplay = useMemo(() => {
    if (!wallet || !base58) return null
    return base58.slice(0, 4) + '..' + base58.slice(-4)
  }, [wallet, base58])

  return (
    <nav className={classes.nav}>
      <div className={classes.nav__left}>
        <NavLink
          className={`${classes.nav}__link`}
          to="/"
          activeClassName={`${classes.nav}__link ${classes.nav}__link--active  `}
        >
          <img src={ninaLogo} className={classes.nav__logo} alt="nina" />
        </NavLink>
        <NavLink
          className={`${classes.nav}__link`}
          to="/upload"
          activeClassName={`${classes.nav}__link ${classes.nav}__link--active  `}
        >
          upload
        </NavLink>
        <NavLink
          className={`${classes.nav}__link`}
          exact
          to="/"
          activeClassName={`${classes.nav}__link ${classes.nav}__link--active  `}
        >
          dashboard
        </NavLink>
      </div>

      <div className={classes.nav__right}>
        <span className={classes.nav__balance}>
          {wallet?.connected ? `balance: $${usdcBalance}` : null}
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
          {userTwitterHandle && 
            <a href={`https://twitter.com/${userTwitterHandle}`} target="_blank" rel="noreferrer">(@{userTwitterHandle})</a>
          }
        </div>
      </div>
    </nav>
  )
}

const useStyles = makeStyles((theme) => ({
  nav: {
    background: `${theme.vars.transparent}`,
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
    '&__link': {
      color: `${theme.vars.black}`,
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      padding: '0 1rem',
      '&--active': {
        textDecoration: 'underline !important',
      },
    },
  },
  nav__left: {
    display: 'flex',
  },
  nav__right: {
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  nav__balance: {
    margin: 'auto',
    color: `${theme.vars.blue}`,
    fontSize: '10px',
  },
  nav__logo: {
    height: '150%',
  },
  nav__button: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '24px',
    fontSize: '10px'
  },
  walletDialogProvider: {
    '& .MuiButton-root': {
      backgroundColor: `${theme.vars.white}`,
    },
    '& .MuiButton-startIcon': {
      display: 'none',
    },
    '& .MuiPaper-root': {
      width: '400px',
      height: '315px',
      ...theme.helpers.gradient,
      '& .MuiDialogTitle-root': {
        color: `${theme.vars.white}`,
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
          background: `${theme.vars.white}`,
          borderRadius: '50px',
          color: `${theme.vars.blue}`,
          fontSize: '14px',
          fontWeight: '700',
          '&:hover': {
            backgroundColor: `${theme.vars.blue}`,
            color: `${theme.vars.white}`,
          },
          '& .MuiButton-endIcon': {
            display: 'none',
          },
        },
      },
    },
  },
  walletButtonWrapper: {
    textTransform: 'capitalize',
    paddingRight: '20px',
    paddingLeft: '20px',
    '& img': {
      display: 'none',
    },
    '& .MuiButton-label:hover': {
      color: `${theme.vars.blue}`,
    },
  },
  connectionDot: {
    height: '8px',
    width: '8px',
    backgroundColor: `${theme.vars.blue}`,
    borderRadius: '50%',
    display: 'inline-block',
    opacity: '19%',
    marginLeft: '10px',
    '&.connected': {
      opacity: '100%',
    },
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
