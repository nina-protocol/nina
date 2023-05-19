import React, { useContext, useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  WalletDialogProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-material-ui'
import softLpLogo from '../assets/soft-lp-logo.png'
import ninaCommon from 'nina-common'
import SlpControls from './SlpControls'

const { NinaContext } = ninaCommon.contexts
const releasePubkey = process.env.REACT_APP_RELEASE_PUBKEY

const NavBar = (props) => {
  const classes = useStyles()
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
    <nav className={classes.nav}>
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
            featuredWallets={2}
          >
            <WalletMultiButton className={classes.walletButtonWrapper}>
              {wallet?.connected
                ? `${wallet.wallet.adapter.name} ${walletDisplay}`
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
    </nav>
  )
}

const useStyles = makeStyles((theme) => ({
  nav: {
    background: `${theme.vars.transparent}`,
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
    height: '18px',
  },
  logo: {
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translate(-50%, 0%)',
    paddingTop: '13px',
    height: '27px',
    zIndex: '10',
  },
  nav__button: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '20px',
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

export default withRouter(NavBar)
