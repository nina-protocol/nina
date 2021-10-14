import React, {useState, useContext, useEffect} from 'react';
import ninaCommon from 'nina-common'
import {useWallet} from '@solana/wallet-adapter-react'

import {makeStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuIcon from '@material-ui/icons/Menu';
import {NavLink} from 'react-router-dom'

const {NinaContext, ReleaseContext} = ninaCommon.contexts


const NavDrawer = () => {
  const classes = useStyles();
  const {collection} = useContext(NinaContext)
  const wallet = useWallet()

  const {
    releaseState,
    getReleasesPublishedByUser,
    filterReleasesPublishedByUser,
    filterReleasesUserCollection,
  } = useContext(ReleaseContext)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userPublishedReleasesCount, setUserPublishedReleasesCount] = useState()
  const [userCollectionReleasesCount, setUserCollectionReleasesCount] = useState()


  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open)
  };

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

  const links = ['home', 'queue', 'collection', 'releases', 'upload', 'about nina', 'faq']

  const list = () => (
    <div
      className={classes.list}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
      {links.map(link => {
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
                <ListItemText primary={`your ${link}  ${userCollectionReleasesCount ? `(${userCollectionReleasesCount})` : ''}`} />
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
                <ListItemText primary={`your ${link}  ${userPublishedReleasesCount ? `(${userPublishedReleasesCount})` : ''}`} />
              </ListItem>
            </NavLink>

          )
        default:
            <NavLink
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

    </div>
  );

  return (
    <div>
      {
        <Box key={'left'}>
          <Button onClick={toggleDrawer(true)} className={classes.toggle}>
            <MenuIcon />
          </Button>
          <Drawer anchor={'left'} open={drawerOpen} onClose={toggleDrawer(false)} BackdropProps={{invisible: true}}>
            {list()}
          </Drawer>
        </Box>
      }
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  toggle: {
    position: 'absolute',
    top: theme.spacing(6),
    left: theme.spacing(2),
    minWidth: 'unset',
    paddingLeft: '0',
    zIndex: '1000'
  },
  list: {
    width: 250,
    height: '100%',
    backgroundColor: theme.vars.black,
    color: theme.vars.white
  },
  drawerLink:{
    color: theme.vars.white
  }
}));

export default NavDrawer;