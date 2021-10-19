import React, { useState, useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles';
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'

import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import MenuIcon from '@mui/icons-material/Menu'
import { NavLink } from 'react-router-dom'

const PREFIX = 'NavDrawer';

const classes = {
  toggle: `${PREFIX}-toggle`,
  list: `${PREFIX}-list`,
  drawerLink: `${PREFIX}-drawerLink`
};

const Root = styled('div')((
  {
    theme
  }
) => ({
  [`& .${classes.toggle}`]: {
    position: 'absolute',
    top: theme.spacing(6),
    left: theme.spacing(2),
    minWidth: 'unset',
    paddingLeft: '0',
    zIndex: '1000',
  },

  [`&.${classes.list}`]: {
    width: 250,
    height: '100%',
    backgroundColor: theme.palette.black,
    color: theme.palette.white,
  },

  [`& .${classes.drawerLink}`]: {
    color: theme.palette.white,
  }
}));

const { NinaContext, ReleaseContext } = ninaCommon.contexts

const NavDrawer = () => {

  const { collection } = useContext(NinaContext)
  const wallet = useWallet()

  const {
    releaseState,
    getReleasesPublishedByUser,
    filterReleasesPublishedByUser,
    filterReleasesUserCollection,
  } = useContext(ReleaseContext)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userPublishedReleasesCount, setUserPublishedReleasesCount] = useState()
  const [userCollectionReleasesCount, setUserCollectionReleasesCount] =
    useState()

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    setDrawerOpen(open)
  }

  useEffect(() => {
    if (wallet?.connected) {
      getReleasesPublishedByUser()
    }
  }, [wallet?.connected])

  useEffect(() => {
    if (wallet?.connected) {
      setUserPublishedReleasesCount(filterReleasesPublishedByUser().length)
      setUserCollectionReleasesCount(filterReleasesUserCollection().length)
    }
  }, [releaseState, collection])

  const links = [
    'home',
    'queue',
    'collection',
    'releases',
    'upload',
    'about nina',
    'faq',
  ]

  const list = () => (
    <Root
      className={classes.list}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {links.map((link) => {
          switch (link) {
            case 'collection':
              return (
                <NavLink
                  className={`${classes.drawerLink}`}
                  to={`/${link}`}
                  activeClassName={`${classes.drawerLink} ${classes.drawerLink}--active  `}
                  key={link}
                >
                  <ListItem button key={link}>
                    <ListItemText
                      primary={`your ${link}  ${
                        userCollectionReleasesCount
                          ? `(${userCollectionReleasesCount})`
                          : ''
                      }`}
                    />
                  </ListItem>
                </NavLink>
              )
            case 'releases':
              return (
                <NavLink
                  className={`${classes.drawerLink}`}
                  to={`/${link}`}
                  activeClassName={`${classes.drawerLink} ${classes.drawerLink}--active  `}
                  key={link}
                >
                  <ListItem button key={link}>
                    <ListItemText
                      primary={`your ${link}  ${
                        userPublishedReleasesCount
                          ? `(${userPublishedReleasesCount})`
                          : ''
                      }`}
                    />
                  </ListItem>
                </NavLink>
              )
            default:
              ;<NavLink
                className={`${classes.drawerLink}`}
                to={`/${link}`}
                activeClassName={`${classes.drawerLink} ${classes.drawerLink}--active  `}
                key={link}
              >
                <ListItem button key={link}>
                  <ListItemText primary={'link'} />
                </ListItem>
              </NavLink>
          }

          return (
            <NavLink
              className={`${classes.drawerLink}`}
              to={`/${link}`}
              activeClassName={`${classes.drawerLink} ${classes.drawerLink}--active  `}
              key={link}
            >
              <ListItem button key={link}>
                <ListItemText primary={link} />
              </ListItem>
            </NavLink>
          )
        })}
      </List>
    </Root>
  )

  return (
    <div>
      {
        <Box key={'left'}>
          <Button onClick={toggleDrawer(true)} className={classes.toggle}>
            <MenuIcon />
          </Button>
          <Drawer
            anchor={'left'}
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            BackdropProps={{ invisible: true }}
          >
            {list()}
          </Drawer>
        </Box>
      }
    </div>
  )
}

export default NavDrawer
