import { useEffect, useState, useContext } from 'react'
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles';

import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  WalletDialogProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-material-ui'
import ninaCommon from 'nina-common'
import SlpSlider from './SlpSlider'

const PREFIX = 'SlpPurchase';

const classes = {
  progessWrapper: `${PREFIX}-progessWrapper`,
  progress: `${PREFIX}-progress`,
  slpPurchase: `${PREFIX}-slpPurchase`,
  purchaseControls: `${PREFIX}-purchaseControls`,
  slpTitle: `${PREFIX}-slpTitle`,
  slpPrice: `${PREFIX}-slpPrice`,
  usd: `${PREFIX}-usd`,
  soft: `${PREFIX}-soft`,
  slpDescription: `${PREFIX}-slpDescription`,
  releasePurchaseCtaWrapper: `${PREFIX}-releasePurchaseCtaWrapper`,
  cta: `${PREFIX}-cta`,
  buyButton: `${PREFIX}-buyButton`,
  mobileButton: `${PREFIX}-mobileButton`,
  stats: `${PREFIX}-stats`,
  stat: `${PREFIX}-stat`,
  remainingSupply: `${PREFIX}-remainingSupply`,
  walletProviderWrapper: `${PREFIX}-walletProviderWrapper`,
  walletDialogProvider: `${PREFIX}-walletDialogProvider`
};

const Root = styled('div')((
  {
    theme
  }
) => ({
  [`& .${classes.progessWrapper}`]: {
    height: '100%',
    width: '100%',
    display: 'flex',
  },

  [`& .${classes.progress}`]: {
    margin: 'auto',
    color: `${theme.palette.blue}`,
  },

  [`&.${classes.slpPurchase}`]: {
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },

  [`& .${classes.purchaseControls}`]: {
    margin: `${theme.spacing('auto', 0, 'auto', 8)}`,
    textAlign: 'left',
    [theme.breakpoints.down('md')]: {
      margin: `${theme.spacing(6, 1)}`,
    },
  },

  [`& .${classes.slpTitle}`]: {
    fontSize: '34px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    lineHeight: '39.1px',
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      fontSize: '15px',
    },
  },

  [`& .${classes.slpPrice}`]: {
    marginBottom: theme.spacing(1),
    '& span': {
      paddingRight: theme.spacing(2),
      fontSize: '14px',
    },
    [theme.breakpoints.down('md')]: {
      textAlign: 'center',
    },
  },

  [`& .${classes.usd}`]: {
    color: `${theme.palette.greyLight}`,
  },

  [`& .${classes.soft}`]: {
    color: `black`,
  },

  [`& .${classes.slpDescription}`]: {
    fontSize: '11px',
    lineHeight: '16px',
    marginBottom: theme.spacing(1),
  },

  [`& .${classes.releasePurchaseCtaWrapper}`]: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-evenly',
  },

  [`& .${classes.cta}`]: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    minWidth: '100%',
    position: 'relative',
  },

  [`& .${classes.buyButton}`]: {
    width: '100%',
    fontSize: '14px',
    color: `${theme.palette.blue}`,
    borderColor: `${theme.palette.blue}`,
    '&:hover': {
      color: `${theme.palette.white}`,
      backgroundColor: `${theme.palette.blue}`,
    },
  },

  [`& .${classes.mobileButton}`]: {
    width: '100%',
    fontSize: '14px',
    color: `${theme.palette.blue}`,
    borderColor: `${theme.palette.blue}`,
    display: 'block',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },

  [`& .${classes.stats}`]: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },

  [`& .${classes.stat}`]: {
    fontSize: '14px',
    [theme.breakpoints.down('md')]: {
      fontSize: '1rem',
    },
  },

  [`& .${classes.remainingSupply}`]: {
    color: `${theme.palette.blue}`,
  },

  [`& .${classes.walletProviderWrapper}`]: {
    width: '100%',
    '& .MuiButton-root': {
      color: `${theme.palette.white}`,
      backgroundColor: `${theme.palette.blue}`,
      width: '100%',
      fontSize: '14px',
      '&:hover': {
        color: `${theme.palette.white}`,
        backgroundColor: `${theme.palette.blue}`,
      },
    },
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
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
      ...theme.gradient,
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
  }
}));

const { NinaContext, ReleaseContext } = ninaCommon.contexts

const SlpPurchase = (props) => {
  const { releasePubkey } = props

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
    <Root className={classes.slpPurchase}>
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
                    Connect Wallet
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
    </Root>
  );
}

export default SlpPurchase
