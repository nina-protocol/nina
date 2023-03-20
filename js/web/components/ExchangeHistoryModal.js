import React, { useContext, useState } from 'react'
import { styled } from '@mui/material/styles'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Link from 'next/link'

const ExchangeHistoryModal = (props) => {
  const { exchangeHistory } = props
  const { displayNameForAccount } = useContext(Nina.Context)
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
                    ? entry.initializer.publicKey
                    : entry.completedBy.publicKey
                  const buyer = entry.isSale
                    ? entry.completedBy.publicKey
                    : entry.initializer.publicKey
                  const amount = entry.isSale
                    ? entry.expectedAmount
                    : entry.initializerAmount
                  return (
                    <tr key={i}>
                      <td>{new Date(entry.updatedAt).toLocaleString()}</td>
                      <td>{amount} USDC</td>
                      <td>
                        <Link className="link" href={`/profiles/${seller}`}>
                          <a>{displayNameForAccount(seller)}</a>
                        </Link>
                      </td>
                      <td>
                        <Link className="link" href={`/profiles/${buyer}`}>
                          <a>{displayNameForAccount(buyer)}</a>
                        </Link>
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
