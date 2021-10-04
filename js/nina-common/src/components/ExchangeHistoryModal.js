import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import Box from '@material-ui/core/Box'
import { Typography } from '@material-ui/core'
import NinaClient from '../utils/client'

export default function ExchangeHistoryModal(props) {
  const { release, exchangeHistory } = props
  const classes = useStyles()
  const [open, setOpen] = useState(false)

  return (
    <Box>
      <Typography
        className={classes.exchangeHistoryCta}
        onClick={() => setOpen(true)}
      >
        Market History <span>({exchangeHistory?.length || 0})</span>
      </Typography>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={classes.paper}>
            <Typography className={classes.header}>
              Secondary <span>Market History</span>
            </Typography>
            <table className={classes.historyTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Seller</th>
                  <th>Buyer</th>
                </tr>
              </thead>
              <tbody className={classes.historyTableBody}>
                {exchangeHistory &&
                  exchangeHistory.map((entry, i) => {
                    return (
                      <tr key={i}>
                        <td>{entry.dateFormatted}</td>
                        <td>
                          {NinaClient.nativeToUiString(
                            entry.price.toNumber(),
                            release.paymentMint
                          )}
                        </td>
                        <td>
                          <a
                            className="link"
                            href={`https://explorer.solana.com/address/${entry.seller.toBase58()}?cluster=devnet`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            ...
                            {entry.seller.toBase58().slice(-6)}
                          </a>
                        </td>
                        <td>
                          <a
                            className="link"
                            href={`https://explorer.solana.com/address/${entry.buyer.toBase58()}?cluster=devnet`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            ...
                            {entry.buyer.toBase58().slice(-6)}
                          </a>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </Fade>
      </Modal>
    </Box>
  )
}

const useStyles = makeStyles((theme) => ({
  exchangeHistoryCta: {
    position: 'absolute',
    bottom: '18px',
    left: '45%',
    transform: 'translate(-50%, 0)',
    cursor: 'pointer',
    fontSize: '10px',
    lineHeight: '11.5px',
    '& span': {
      color: `${theme.vars.blue}`,
    },
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(6, 4),
    ...theme.helpers.gradient,
  },
  header: {
    fontSize: '26px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    fontWeight: '700',
    lineHeight: '29.9px',
  },
  historyTable: {
    padding: `${theme.spacing(1, 1)}`,
    display: 'block',
    maxHeight: '50vh',
    overflow: 'scroll',
    '& th': {
      textTransform: 'uppercase',
    },
  },
  historyTableBody: {
    '& td': {
      '& ': {
        padding: `${theme.spacing(0, 2)}`,
      },
      '& a': {
        color: `${theme.vars.white}`,
      },
    },
  },
}))
