import React, { useContext, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import { Typography, Box } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import ninaCommon from 'nina-common'
import NavDrawer from './NavDrawer'
import { withFormik } from 'formik'
import { NavLink, Link } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  WalletDialogProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-material-ui'
import Breadcrumbs from './Breadcrumbs'
import MobileWalletModal from './MobileWalletModal'
const { NinaContext, ConnectionContext } = ninaCommon.contexts

const NavBar = () => {
  const { usdcBalance } = useContext(NinaContext)
  const { healthOk } = useContext(ConnectionContext)
  const wallet = useWallet()
  const base58 = useMemo(
    () => wallet?.publicKey?.toBase58(),
    [wallet?.publicKey]
  )
  const walletDisplay = useMemo(() => {
    if (!wallet || !base58) return null
    return base58.slice(0, 4) + '..' + base58.slice(-4)
  }, [wallet, base58])

  let connectedString = 'connected-healthy'
  if (wallet.connected && !healthOk) {
    connectedString = 'connected-unhealthy'
  }

  return (
    <Root className={classes.nav}>
      <div className={classes.nav__left}>
        <NavDrawer />
        <Breadcrumbs />
      </div>

      <Logo to="/">
        <Typography variant="h4">NINA</Typography>
      </Logo>

      <div className={classes.nav__right}>
        <DesktopWalletWrapper>
          <PublishLink to="/upload">
            <Typography variant="subtitle1">Start Publishing</Typography>
          </PublishLink>
          <Typography variant="subtitle1" className={classes.nav__balance}>
            {wallet?.connected ? `Balance: $${usdcBalance}` : null}
          </Typography>
          <div className={classes.nav__button}>
            <StyledWalletDialogProvider featuredWallets={4}>
              <StyledWalletButton>
                <Typography variant="subtitle1" sx={{ textTransform: 'none' }}>
                  {wallet?.connected
                    ? `${wallet.wallet.name} – ${walletDisplay}`
                    : 'Connect Wallet'}
                </Typography>
              </StyledWalletButton>
              <Tooltip
                title={
                  healthOk
                    ? 'Network Status: Good'
                    : 'Network Status: Degraded - Transactions may fail.'
                }
                placement="bottom-end"
              >
                <ConnectionDot
                  className={`${classes.connectionDot} ${
                    wallet?.connected ? connectedString : ''
                  }`}
                ></ConnectionDot>
              </Tooltip>
            </StyledWalletDialogProvider>
          </div>
        </DesktopWalletWrapper>

        <MobileWalletWrapper>
          <MobileWalletModal />
        </MobileWalletWrapper>
      </div>
    </Root>
  )
}

const PREFIX = 'NavBar'

const classes = {
  nav: `${PREFIX}-nav`,
  nav__left: `${PREFIX}-nav__left`,
  nav__right: `${PREFIX}-nav__right`,
  nav__balance: `${PREFIX}-nav__balance`,
  nav__logo: `${PREFIX}-nav__logo`,
  nav__button: `${PREFIX}-nav__button`,
  walletDialogProvider: `${PREFIX}-walletDialogProvider`,
  walletButtonWrapper: `${PREFIX}-walletButtonWrapper`,
  connectionDot: `${PREFIX}-connectionDot`,
}

const Root = styled('nav')(({ theme }) => ({
  [`&.${classes.nav}`]: {
    background: `${theme.palette.transparent}`,
    height: '30px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    zIndex: '12',
    padding: theme.spacing(1),
    marginBottom: '0.5rem',
    paddingRight: '0',
    position: 'absolute',
    top: '0',
    left: '0',
  },

  [`& .${classes.nav__left}`]: {
    display: 'flex',
    alignItems: 'flex-start',
  },

  [`& .${classes.nav__right}`]: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    position: 'absolute',
    right: 0,
    top: '12px',
    [theme.breakpoints.down('md')]: {
      position: 'absolute',
      right: 0,
      top: '10px',
    },
  },

  [`& .${classes.nav__balance}`]: {
    margin: '0',
    color: `${theme.palette.blue}`,
  },

  [`& .${classes.nav__logo}`]: {
    height: '100%',
    alignItems: 'center',
  },

  [`& .${classes.nav__button}`]: {
    display: 'flex',
    alignItems: 'flex-start',
    marginRight: '24px',
  },
}))

const DesktopWalletWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}))
const MobileWalletWrapper = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
  },
}))

const StyledWalletDialogProvider = styled(WalletDialogProvider)(
  ({ theme }) => ({
    '& .MuiButton-root': {
      backgroundColor: `${theme.palette.white}`,
    },
    '& .MuiButton-startIcon': {
      display: 'none',
    },
    '& .MuiPaper-root': {
      width: '400px',
      height: 'auto',
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
          fontSize: '10px',
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
  })
)

const StyledWalletButton = styled(WalletMultiButton)(({ theme }) => ({
  textTransform: 'capitalize',
  paddingRight: '20px',
  paddingLeft: '20px',
  backgroundColor: `${theme.palette.transparent} !important`,
  boxShadow: 'none !important',
  paddingTop: '0 !important',

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

const ConnectionDot = styled('span')(({ theme }) => ({
  height: '11px',
  width: '14px',
  backgroundColor: theme.palette.red,
  borderRadius: '50%',
  display: 'inline-block',
  marginTop: '2px',
  '&.connected-healthy': {
    backgroundColor: theme.palette.green,
  },
  '&.connected-unhealthy': {
    backgroundColor: theme.palette.yellow,
  },
}))

const Logo = styled(NavLink)(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  top: '15px',
  width: '76px',
  height: '13px',
  left: '50%',
  transform: 'translateX(-50%)',
  '& .MuiTypography-h4': {
    fontWeight: 'bold',
  },
}))

const PublishLink = styled(Link)(() => ({
  width: '115px',
}))

export default withFormik({
  enableReinitialize: true,
  mapPropsToValues: () => {
    return {
      query: '',
    }
  },
})(NavBar)
