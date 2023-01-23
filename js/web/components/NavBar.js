import React, { useContext, useMemo, useState, useEffect } from 'react'
import { configureScope } from '@sentry/nextjs'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import NavDrawer from './NavDrawer'
import { withFormik } from 'formik'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/router'
import {
  WalletDialogProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-material-ui'
import Breadcrumbs from './Breadcrumbs'
import NavSearch from './NavSearch'
import SearchIcon from '@mui/icons-material/Search'
import EmailCapture from '@nina-protocol/nina-internal-sdk/esm/EmailCapture'
import FeedDrawer from './FeedDrawer'

const NavBar = () => {
  const router = useRouter()
  const {
    healthOk,
    getSubscriptionsForUser,
    filterSubscriptionsForUser,
    subscriptionState,
    getUserBalances,
  } = useContext(Nina.Context)
  const wallet = useWallet()
  const base58 = useMemo(
    () => wallet?.publicKey?.toBase58(),
    [wallet?.publicKey]
  )
  const walletDisplay = useMemo(() => {
    if (!wallet || !base58) return null
    return base58.slice(0, 4) + '..' + base58.slice(-4)
  }, [wallet, base58])
  const [connectedString, setConnectedString] = useState()

  useEffect(() => {
    setConnectedString(healthOk ? 'connected-healthy' : 'connected-unhealthy')
  }, [healthOk])

  useEffect(() => {
    if (wallet.connected) {
      getSubscriptionsForUser(wallet.publicKey.toBase58())
      getUserBalances()

      configureScope((scope) => {
        scope.setTag('wallet', wallet.publicKey.toBase58())
      })
    }
  }, [wallet.connected])

  return (
    <Root>
      <NavLeft>
        <NavDrawer />
        <Breadcrumbs />
        <SearchIconWrapper>
          <Link href="/search" passHref>
            <SearchIcon onClick={() => router.push('/search')} />
          </Link>
        </SearchIconWrapper>
      </NavLeft>

      <Logo>
        <Link href="/" passHref>
          <Typography variant="h4">NINA</Typography>
        </Link>
      </Logo>

      <NavRight>
        <DesktopWalletWrapper>
          <NavCtas>
            <SearchBarWrapper>
              <NavSearch />
            </SearchBarWrapper>
            <UploadWrapper>
              {!wallet.connected ? (
                <EmailCapture size="small" />
              ) : (
                <BlueTypography
                  sx={{
                    padding: { md: '2px', xs: '0px 0px' },
                    border: '1px solid #2D81FF',
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  <Link href="/upload">Upload</Link>
                </BlueTypography>
              )}
            </UploadWrapper>
            {wallet.wallets && (
              <StyledWalletDialogProvider featuredWallets={4}>
                <StyledWalletButton>
                  <Typography
                    variant="subtitle1"
                    sx={{ textTransform: 'none' }}
                  >
                    {wallet?.connected
                      ? `${wallet.wallet.adapter.name} – ${walletDisplay}`
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
            )}
          </NavCtas>
        </DesktopWalletWrapper>
      </NavRight>
      <FeedDrawer />
    </Root>
  )
}

const PREFIX = 'NavBar'

const classes = {
  nav: `${PREFIX}-nav`,
  walletDialogProvider: `${PREFIX}-walletDialogProvider`,
  walletButtonWrapper: `${PREFIX}-walletButtonWrapper`,
  connectionDot: `${PREFIX}-connectionDot`,
}

const Root = styled('nav')(({ theme }) => ({
  background: `${theme.palette.transparent}`,
  height: '30px',
  width: '100vw',
  zIndex: '12',
  padding: theme.spacing(1, 0),
  marginBottom: '0.5rem',
  position: 'fixed',
  top: '0',
  left: '0',
}))

const NavLeft = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  paddingLeft: theme.spacing(1),
}))

const SearchIconWrapper = styled('div')(({ theme }) => ({
  marginLeft: '15px',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}))

const NavRight = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'absolute',
  right: theme.spacing(1),
  top: '12px',
  [theme.breakpoints.down('md')]: {
    position: 'absolute',
    right: 0,
    top: '15px',
  },
}))

const NavCtas = styled('div')(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
}))
const SearchBarWrapper = styled('div')(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    position: 'absolute',
    right: '270px',
    display: 'none',
  },
}))
const UploadWrapper = styled('div')(({ theme }) => ({
  marginRight: theme.spacing(1),
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}))

const Logo = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'min-content',
  cursor: 'pointer',
  '&:hover': {
    color: theme.palette.blue,
  },
  '& .MuiTypography-h4': {
    fontWeight: 'bold',
  },
}))

const DesktopWalletWrapper = styled(Box)(() => ({
  display: 'flex',
}))
const StyledWalletDialogProvider = styled(WalletDialogProvider)(
  ({ theme }) => ({
    '& .MuiList-root': {
      background: `${theme.palette.transparent} !important`,
    },
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
        color: `${theme.palette.white} !important`,
        textAlign: 'center',
        padding: '60px 0 0',
        textTransform: 'uppercase',
        margin: 'auto',
        background: 'none !important',
        fontSize: '16px !important',
        fontWeight: '700 !important',
        '& h2': {
          backgroundColor: `${theme.palette.white} !important`,
        },
        '& .MuiButtonBase-root': {
          display: 'none',
        },
      },
      '& .MuiDialogContent-root': {
        padding: '24px',
      },
      '& .MuiListItem-root': {
        padding: `8px 24px`,
        boxShadow: 'none',
        width: '241px',
        margin: 'auto',
        '&:hover': {
          boxShadow: 'none',
        },
        '& .MuiButton-root': {
          textAlign: 'center',
          borderRadius: '50px',
          color: `${theme.palette.blue}`,
          fontSize: '10px',
          fontWeight: '700',
          justifyContent: 'center',
          textTransform: 'uppercase',
          padding: '6px 0',
          '&:hover': {
            opacity: '1',
            backgroundColor: `${theme.palette.blue} !important`,
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
  marginTop: '2px',
  '& img': {
    display: 'none',
  },
  '& .MuiButton-label': {
    color: theme.palette.black,
  },
  '& .MuiButton-label:hover': {
    color: theme.palette.blue,
  },
}))

const ConnectionDot = styled('span')(({ theme }) => ({
  height: '11px',
  width: '14px',
  backgroundColor: theme.palette.red,
  borderRadius: '50%',
  display: 'inline-block',
  marginTop: '4px',
  '&.connected-healthy': {
    backgroundColor: theme.palette.green,
  },
  '&.connected-unhealthy': {
    backgroundColor: theme.palette.yellow,
  },
  [theme.breakpoints.down('md')]: {
    marginRight: '15px',
  },
}))

const BlueTypography = styled(Typography)(({ theme }) => ({
  '& a': { color: theme.palette.blue },
  cursor: 'pointer',
}))

export default withFormik({
  enableReinitialize: true,
  mapPropsToValues: () => {
    return {
      query: '',
    }
  },
})(NavBar)
