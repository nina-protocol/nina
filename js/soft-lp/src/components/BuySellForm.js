import React, { useEffect, useState, useContext } from 'react'
import { withFormik } from 'formik'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Input from '@material-ui/core/Input'
import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/core/styles'
import { useWallet } from '@solana/wallet-adapter-react'
import ninaCommon from 'nina-common'

const { ExchangeContext } = ninaCommon.contexts

const BuySellForm = (props) => {
  const { onSubmit, isBuy, release, amount, setAmount } = props
  const classes = useStyles()
  const wallet = useWallet()
  const { exchangeInitPending } = useContext(ExchangeContext)
  const [pending, setPending] = useState(false)
  const [buyPending, setBuyPending] = useState(false)
  const [sellPending, setSellPending] = useState(false)

  useEffect(() => {
    setPending(exchangeInitPending[release.publicKey.toBase58()])
  }, [exchangeInitPending[release.publicKey.toBase58()]])

  useEffect(() => {
    if (pending && exchangeInitPending.isSelling) {
      setSellPending(true)
    } else if (pending && !exchangeInitPending.isSelling) {
      setBuyPending(true)
    } else {
      setBuyPending(false)
      setSellPending(false)
    }
  }, [pending])

  const handleSubmit = async (e) => {
    e.preventDefault()

    await onSubmit(e, isBuy, amount)
    setAmount()
  }

  const handleChange = (e) => {
    if (/^\d+(\.\d{0,4})?$|^(\.\d{0,4})?$|^(?![\s\S])/.test(e.target.value)) {
      setAmount(e.target.value)
    } else {
      e.target.value = amount
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={classes.buySellForm}
        autoComplete="off"
      >
        <Box mb={2} className={classes.exchangeCtaWrapper}>
          <Input
            id="buy-sell__input"
            type="input"
            name="amount"
            className={`${classes.buySellForm}__inputLabel`}
            onChange={(e) => handleChange(e)}
            disableUnderline={true}
            placeholder="Enter price in SOL"
            value={amount !== undefined ? amount : ''}
          />
          <Button
            variant="contained"
            className={`${classes.cta}`}
            type="submit"
            disabled={!wallet?.connected}
            disableRipple={true}
          >
            {isBuy && buyPending && (
              <CircularProgress size={30} color="inherit" />
            )}

            {!isBuy && sellPending && (
              <CircularProgress size={30} color="inherit" />
            )}
            {isBuy && !buyPending && 'Submit'}
            {!isBuy && !sellPending && 'Submit'}
          </Button>
        </Box>
      </form>
    </>
  )
}

const useStyles = makeStyles((theme) => ({
  buySellForm: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: 'auto',
    marginTop: `${theme.spacing(1)}px`,
    borderBottom: `1px solid ${theme.vars.greyLight}`,
    backgroundColor: `${theme.vars.white}`,
    '&__inputLabel': {
      fontSize: '2rem',
      width: '73%',
      border: `1px dashed ${theme.vars.blue}`,
      '& input': {
        textAlign: 'center !important',
        padding: '0',
        height: '41px',
        '&[type=number]': {
          '-moz-appearance': 'textfield',
        },
        '&::-webkit-outer-spin-button': {
          '-webkit-appearance': 'none',
          margin: 0,
        },
        '&::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          margin: 0,
        },
        '&::placeholder': {
          fontSize: '10px',
          verticalAlign: 'middle',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        },
      },
    },
    '&:hover': {
      color: `${theme.vars.blue}`,
    },
  },
  exchangeCtaWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cta: {
    width: '25%',
    background: `${theme.vars.white}`,
    fontSize: '16px',
    fontWeight: '400',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: `${theme.vars.white}`,
      boxShadow: 'none',
    },
    '&.Mui-disabled': {
      background: `${theme.vars.white}`,
    },
  },
}))

export default withFormik({
  enableReinitialize: true,
  mapPropsToValues: () => {
    return {
      amount: 0.0,
    }
  },
})(BuySellForm)
