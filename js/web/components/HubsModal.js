import React, { useState, useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'

const HubsModal = (props) => {
  const { releasePubkey, metadata } = props
  const { getHubsForRelease } = useContext(Release.Context)
  const [open, setOpen] = useState(false)
  const [hubs, setHubs] = useState([])
  useEffect(() => {
    handleGetHubsForRelease(releasePubkey)
  }, [])

  const handleGetHubsForRelease = async (releasePubkey) => {
    const hubsList = await getHubsForRelease(releasePubkey)

    setHubs(hubsList)
  }

  return (
    <Box>
      <Cta
        onClick={() => setOpen(true)}
        variant="body2"
        align="left"
        paddingBottom="10px"
      >
        {`View Hubs ${hubs ? `(${hubs.length})` : ''}`}
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
            <Typography fontWeight="700">{`Hubs featuring: ${metadata.properties.artist.substring(
              0,
              100
            )} - "${metadata.properties.title.substring(0, 100)}"`}</Typography>
          </Header>
          <CollectorTable>
            <TableBody>
              {hubs &&
                hubs.map((entry, i) => {
                  return (
                    <tr key={i}>
                      <td>
                        <a
                          href={entry.json.externalUrl}
                          passHref
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {entry.json.displayName}
                        </a>
                      </td>
                    </tr>
                  )
                })}
            </TableBody>
          </CollectorTable>
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

export default HubsModal
