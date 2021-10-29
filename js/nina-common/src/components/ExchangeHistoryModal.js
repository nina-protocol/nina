import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'
import { Typography } from '@mui/material'
import NinaClient from '../utils/client'

const ExchangeHistoryModal = (props) => {
  const { release, exchangeHistory } = props

  const [open, setOpen] = useState(false)

  return (
    <StyledBox>
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
              SECONDARY <span>MARKET HISTORY</span>
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
                            href={`https://solscan.io/account/${entry.seller.toBase58()}`}
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
                            href={`https://solscan.io/account/${entry.buyer.toBase58()}`}
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
    </StyledBox>
  )
}

const PREFIX = 'ExchangeHistoryModal'

const classes = {
  exchangeHistoryCta: `${PREFIX}-exchangeHistoryCta`,
  modal: `${PREFIX}-modal`,
  paper: `${PREFIX}-paper`,
  header: `${PREFIX}-header`,
  historyTable: `${PREFIX}-historyTable`,
  historyTableBody: `${PREFIX}-historyTableBody`,
}

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.exchangeHistoryCta}`]: {
    position: 'absolute',
    bottom: '18px',
    left: '45%',
    transform: 'translate(-50%, 0)',
    cursor: 'pointer',
    fontSize: '10px',
    lineHeight: '11.5px',
    '& span': {
      color: `${theme.palette.blue}`,
    },
  },

  [`& .${classes.modal}`]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  [`& .${classes.paper}`]: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(6, 4),
    ...theme.gradient,
  },

  [`& .${classes.header}`]: {
    fontSize: '26px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    fontWeight: '700',
    lineHeight: '29.9px',
  },

  [`& .${classes.historyTable}`]: {
    padding: `${theme.spacing(1, 1)}`,
    display: 'block',
    maxHeight: '50vh',
    overflow: 'scroll',
    '& th': {
      textTransform: 'uppercase',
    },
  },

  [`& .${classes.historyTableBody}`]: {
    '& td': {
      '& ': {
        padding: `${theme.spacing(0, 2)}`,
      },
      '& a': {
        color: `${theme.palette.white}`,
      },
    },
  },
}))

export default ExchangeHistoryModal
