import React, { useState, useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import { useWallet } from '@solana/wallet-adapter-react'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Link from 'next/link'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
const CollectorModal = (props) => {
  const { metadata, releasePubkey } = props
  const wallet = useWallet()
  const { displayNameForAccount, collection } = useContext(Nina.Context)
  const { getCollectorsForRelease } = useContext(Release.Context)
  const [open, setOpen] = useState(false)
  const [collectors, setCollectors] = useState()

  useEffect(() => {
    handleGetCollectorsForRelease(releasePubkey)
  }, [collection])
  const handleGetCollectorsForRelease = async (releasePubkey) => {
    const collectorsList = await getCollectorsForRelease(releasePubkey)

    if (wallet?.publicKey) {
      const walletPublicKey = wallet.publicKey.toBase58()
      if (
        collection[releasePubkey] > 0 &&
        !collectorsList.includes(walletPublicKey)
      ) {
        collectorsList.push(walletPublicKey)
      } else if (
        collectorsList.includes(walletPublicKey) &&
        collection[releasePubkey] <= 0
      ) {
        const index = collectorsList.indexOf(walletPublicKey)
        if (index > -1) {
          collectorsList.splice(index, 1)
        }
      }
    }

    setCollectors(collectorsList)
  }

  return (
    <>
      {collectors?.length > 0 ? (
        <Box sx={{ paddingBottom: '10px' }}>
          <Cta onClick={() => setOpen(true)} variant="body2" align="left">
            {`View Collectors ${collectors ? `(${collectors?.length})` : ''}`}
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
                <Typography fontWeight="700">{`${metadata.properties.artist.substring(
                  0,
                  100
                )} - "${metadata.properties.title.substring(
                  0,
                  100
                )}" Collectors`}</Typography>
              </Header>
              <CollectorTable>
                <TableBody>
                  {collectors &&
                    collectors.map((entry, i) => {
                      return (
                        <tr key={i}>
                          <td>
                            <Link href={`/profiles/${entry}`} passHref>
                              <a>{displayNameForAccount(entry)}</a>
                            </Link>
                          </td>
                          <td>
                            <Link
                              href={`/profiles/${entry}?view=collection`}
                              passHref
                            >
                              <a>View Collection</a>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                </TableBody>
              </CollectorTable>
            </StyledPaper>
          </StyledModal>
        </Box>
      ) : (
        <Box sx={{ cursor: 'default' }}>
          <Typography variant="body2" align="left" paddingBottom="10px">
            Collectors (0)
          </Typography>
        </Box>
      )}
    </>
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
  width: 'max-content',
  '& span': {
    color: `${theme.palette.blue}`,
  },
  ':hover': {
    opacity: 0.5,
  },
}))

const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  'a:hover': {
    opacity: 0.5,
  },
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

const CollectorTable = styled('table')(({ theme }) => ({
  padding: `${theme.spacing(1, 1)}`,
  display: 'block',
  maxHeight: '50vh',
  overflowY: 'scroll',
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
      whiteSpace: 'nowrap',
    },
  },
}))

export default CollectorModal
