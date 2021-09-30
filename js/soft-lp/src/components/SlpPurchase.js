import { useEffect, useState, useContext } from 'react'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Box from '@material-ui/core/Box'
import { Typography } from '@material-ui/core'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  WalletDialogProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-material-ui'
import ninaCommon from 'nina-common'
import SlpSlider from './SlpSlider'

const { NinaContext, ReleaseContext } = ninaCommon.contexts

const SlpPurchase = (props) => {
  const { releasePubkey } = props
  const classes = useStyles()
  const theme = useTheme()
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const { releasePurchase, releasePurchasePending, releaseState, getRelease } =
    useContext(ReleaseContext)
  const { getAmountHeld, solPrice, getSolPrice } = useContext(NinaContext)
  const [pending, setPending] = useState(undefined)
  const [release, setRelease] = useState(undefined)
  const [buttonText, setButtonText] = useState('')
  const [buttonDisabled, setButtonDisabled] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!release.pending) {
      enqueueSnackbar('Making transaction...', {
        variant: 'info',
      })
      const result = await releasePurchase(releasePubkey)
      if (result) {
        enqueueSnackbar(result.msg, {
          variant: result.success ? 'success' : 'warn',
        })
      }
    }
  }

  useEffect(() => {
    getSolPrice()
  }, [])

  useEffect(() => {
    setButtonText(release?.remainingSupply > 0 ? `PURCHASE` : 'SOLD OUT')
    setButtonDisabled(release?.remainingSupply > 0 ? false : true)
  }, [release])

  useEffect(() => {
    getRelease(releasePubkey)
  }, [releasePubkey])

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey])
    }
  }, [releaseState.tokenData[releasePubkey]])

  useEffect(() => {
    setPending(releasePurchasePending[releasePubkey])
  }, [releasePurchasePending[releasePubkey]])

  useEffect(() => {
    if (releaseState.metadata[releasePubkey]) {
      getAmountHeld(releaseState.releaseMintMap[releasePubkey], releasePubkey)
    }
  }, [releaseState?.metadata[releasePubkey]])

  if (!release) {
    return (
      <Box className={classes.progessWrapper}>
        <CircularProgress color="inherit" className={classes.progress} />
      </Box>
    )
  }

  return (
    <div className={classes.slpPurchase}>
      <SlpSlider />

      <Box className={classes.purchaseControls}>
        <Box className={classes.stats}>
          <Typography variant="body1" className={classes.stat}>
            Remaining{' '}
            <span className={classes.remainingSupply}>
              {release.remainingSupply.toNumber()}
            </span>{' '}
            / {release.totalSupply.toNumber()}
          </Typography>
        </Box>

        <Typography className={classes.slpTitle}>
          {`The Nina Soft Launch Product`}
        </Typography>

        <Typography className={classes.slpPrice}>
          <span className={classes.sol}> 1 SOL </span>{' '}
          <span className={classes.usd}>{solPrice} USD</span>{' '}
          <span className={classes.soft}>1 SOFT</span>
        </Typography>

        <Typography className={classes.slpDescription}>
          {`A tokenized slipmat for your turntable.  Buy and sell SOFT in our market or redeem to get the physical Soft LP mailed anywhere in the world. Silkscreened purple ink on white felt.  Published in an edition of 1000.`}
        </Typography>

        <form
          className={`${classes.releasePurchase}__form`}
          style={theme.helpers.flexColumn}
          onSubmit={handleSubmit}
        >
          <Box className={classes.releasePurchaseCtaWrapper}>
            {wallet?.connected && (
              <Box className={classes.cta}>
                <Button
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={buttonDisabled}
                  className={classes.buyButton}
                >
                  {pending ? (
                    <CircularProgress size={25} color="inherit" />
                  ) : (
                    buttonText
                  )}
                </Button>
              </Box>
            )}

            {!wallet.connected && (
              <Box className={classes.walletProviderWrapper}>
                <WalletDialogProvider
                  className={classes.walletDialogProvider}
                  featuredWallets={4}
                >
                  <WalletMultiButton className={classes.walletButtonWrapper}>
                    Select Wallet
                  </WalletMultiButton>
                </WalletDialogProvider>
              </Box>
            )}

            <Button
              variant="outlined"
              color="primary"
              type="submit"
              disabled={true}
              className={classes.mobileButton}
            >
              Mobile Coming Soon
            </Button>
          </Box>
        </form>
      </Box>
    </div>
  )
}

const useStyles = makeStyles((theme) => ({
  progessWrapper: {
    height: '100%',
    width: '100%',
    display: 'flex',
  },
  progress: {
    margin: 'auto',
    color: `${theme.vars.blue}`,
  },
  slpPurchase: {
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  purchaseControls: {
    margin: `${theme.spacing('auto', 0, 'auto', 8)}`,
    textAlign: 'left',
    [theme.breakpoints.down('sm')]: {
      margin: `${theme.spacing(6, 1)}`,
    },
  },
  slpTitle: {
    fontSize: '34px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    lineHeight: '39.1px',
    marginBottom: `${theme.spacing(1)}px`,
    [theme.breakpoints.down('sm')]: {
      fontSize: '15px',
    },
  },
  slpPrice: {
    marginBottom: `${theme.spacing(1)}px`,
    '& span': {
      paddingRight: `${theme.spacing(2)}px`,
      fontSize: '14px',
    },
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
    },
  },
  usd: {
    color: `${theme.vars.greyLight}`,
  },
  soft: {
    color: `black`,
  },
  slpDescription: {
    fontSize: '11px',
    lineHeight: '16px',
    marginBottom: `${theme.spacing(1)}px`,
  },
  releasePurchaseCtaWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-evenly',
  },
  cta: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    minWidth: '100%',
    position: 'relative',
  },
  buyButton: {
    width: '100%',
    fontSize: '14px',
    color: `${theme.vars.blue}`,
    borderColor: `${theme.vars.blue}`,
    '&:hover': {
      color: `${theme.vars.white}`,
      backgroundColor: `${theme.vars.blue}`,
    },
  },
  mobileButton: {
    width: '100%',
    fontSize: '14px',
    color: `${theme.vars.blue}`,
    borderColor: `${theme.vars.blue}`,
    display: 'block',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  stats: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: `${theme.spacing(1)}px`,
  },
  stat: {
    fontSize: '14px',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1rem',
    },
  },
  remainingSupply: {
    color: `${theme.vars.blue}`,
  },
  walletProviderWrapper: {
    width: '100%',
    '& .MuiButton-root': {
      color: `${theme.vars.white}`,
      backgroundColor: `${theme.vars.blue}`,
      width: '100%',
      fontSize: '14px',
      '&:hover': {
        color: `${theme.vars.white}`,
        backgroundColor: `${theme.vars.blue}`,
      },
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
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
}))

export default SlpPurchase
