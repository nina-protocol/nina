import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import Typography from '@material-ui/core/Typography'

export default function RedeemableUpdateShippingList(props) {
  const classes = useStyles()
  const {
    userRedemptionRecords,
    handleSelectRecord,
    setSelectedRecord,
    selectedRecord,
  } = props

  useEffect(() => {
    if (!selectedRecord) {
      setSelectedRecord(userRedemptionRecords[0])
    }
  }, [userRedemptionRecords])

  if (!userRedemptionRecords || !selectedRecord) {
    return <></>
  }

  return (
    <div className={classes.root}>
      <Typography variant="h6">My Redemptions:</Typography>
      <List className={classes.list} aria-label="redemption-records">
        {userRedemptionRecords.map((record, i) => {
          return (
            <ListItem
              button
              key={i}
              selected={
                record.publicKey.toBase58() ===
                selectedRecord.publicKey.toBase58()
              }
              onClick={(event) => handleSelectRecord(event, i)}
              className={classes.listItem}
              ContainerProps={{ noWrap: true }}
            >
              <ListItemIcon className={classes.icon}>
                {record.shipper ? (
                  <CheckBoxIcon />
                ) : (
                  <CheckBoxOutlineBlankIcon />
                )}
              </ListItemIcon>
              <ListItemText
                nowrap
                className={classes.listItemText}
                primary={record.redeemer.toBase58()}
              />
            </ListItem>
          )
        })}
      </List>
      <Divider />
    </div>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    backgroundColor: theme.vars.transparent,
  },
  list: {
    maxHeight: '50vh',
    overflowY: 'scroll',
  },
  listItem: {
    paddingLeft: '0.5rem',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  listItemText: {
    '& span': {
      whiteSpace: 'nowrap',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  icon: {
    minWidth: '12px',
    color: `${theme.vars.purple}`,
  },
}))
