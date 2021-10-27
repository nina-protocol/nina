import React, { useEffect } from 'react'
import { styled } from '@mui/material/styles';
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import Typography from '@mui/material/Typography'
import UserRedemptionsList from './RedeemableUpdateShippingList';

const UserRedemptionsList = (props) => {
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
    <Root className={classes.root}>
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
    </Root>
  );
}

const PREFIX = 'UserRedemptionsList';

const classes = {
  root: `${PREFIX}-root`,
  list: `${PREFIX}-list`,
  listItem: `${PREFIX}-listItem`,
  listItemText: `${PREFIX}-listItemText`,
  icon: `${PREFIX}-icon`
};

const Root = styled('div')((
  {
    theme
  }
) => ({
  [`&.${classes.root}`]: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    backgroundColor: theme.palette.transparent,
  },

  [`& .${classes.list}`]: {
    maxHeight: '50vh',
    overflowY: 'scroll',
  },

  [`& .${classes.listItem}`]: {
    paddingLeft: '0.5rem',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },

  [`& .${classes.listItemText}`]: {
    '& span': {
      whiteSpace: 'nowrap',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },

  [`& .${classes.icon}`]: {
    minWidth: '12px',
    color: `${theme.palette.purple}`,
  }
}));

export default UserRedemptionsList;
