import React, { useContext, useState } from 'react'
import { styled } from '@mui/material/styles'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'

const ExchangeHistoryModal = (props) => {
  const { release, exchangeHistory } = props
  const { ninaClient } = useContext(Nina.Context)
  const [open, setOpen] = useState(false)

  return (
    <Box color={'wj'}>
      <Cta onClick={() => setOpen(true)} variant="subtitle1">
        Market History <span>({exchangeHistory?.length || 0})</span>
      </Cta>
      <StyledModal
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
        <StyledPaper>
          <Header>
            SECONDARY
            <Typography fontWeight="700">MARKET HISTORY</Typography>
          </Header>
          <HistoryTable>
            <thead>
              <tr>
                <th>Date</th>
                <th>Price</th>
                <th>Seller</th>
                <th>Buyer</th>
              </tr>
            </thead>
            <TableBody>
              {exchangeHistory &&
                exchangeHistory.map((entry, i) => {
                  const seller = entry.isSale
                    ? entry.initializer
                    : entry.completedBy
                  const buyer = entry.isSale
                    ? entry.completedBy
                    : entry.initializer
                  const amount = entry.isSale
                    ? entry.expectedAmount * 1000000
                    : entry.initializerAmount
                  return (
                    <tr key={i}>
                      <td>{entry.updatedDate}</td>
                      <td>
                        {ninaClient.nativeToUiString(
                          amount,
                          release.paymentMint
                        )}
                      </td>
                      <td>
                        <a
                          className="link"
                          href={`https://solscan.io/account/${seller}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {seller.slice(0, 6)}...{seller.slice(-6)}
                        </a>
                      </td>
                      <td>
                        <a
                          className="link"
                          href={`https://solscan.io/account/${buyer}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {buyer.slice(0, 6)}...{buyer.slice(-6)}
                        </a>
                      </td>
                    </tr>
                  )
                })}
            </TableBody>
          </HistoryTable>
        </StyledPaper>
      </StyledModal>
    </Box>
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

const Cta = styled(Typography)(({ theme }) => ({
  cursor: 'pointer',
  '& span': {
    color: `${theme.palette.blue}`,
  },
}))

const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(6, 4),
  ...theme.gradient,
  zIndex: '10',
}))

const Header = styled(Typography)(({ theme }) => ({
  fontSize: '26px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  fontWeight: '700',
  lineHeight: '29.9px',
  color: theme.palette.white,
}))

const HistoryTable = styled('table')(({ theme }) => ({
  padding: `${theme.spacing(1, 1)}`,
  display: 'block',
  maxHeight: '50vh',
  overflow: 'scroll',
  color: theme.palette.white,
  [theme.breakpoints.down('md')]: {
    width: '80vw',
  },
  '& th': {
    textTransform: 'uppercase',
  },
}))

const TableBody = styled('tbody')(({ theme }) => ({
  '& td': {
    '& ': {
      padding: `${theme.spacing(0, 2)}`,
    },
    '& a': {
      color: `${theme.palette.white}`,
    },
  },
}))

export default ExchangeHistoryModal
