import React, { useState, useContext, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import ninaCommon from 'nina-common'
import { useWallet } from '@solana/wallet-adapter-react'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { NavLink } from 'react-router-dom'
import { Icon } from '@material-ui/core'
import hamburger from '../assets/hamburger.svg'

const { NinaContext, ReleaseContext } = ninaCommon.contexts

const linksConnected = [
  'home',
  'collection',
  'releases',
  'upload',
  'about nina',
  'faq',
]

const linksNotConnected = [
  'home',
  'upload',
  'about nina',
  'faq',
]

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
  const [links, setLinks] = useState(linksNotConnected)

  useEffect(() => {
    if (wallet?.connected) {
      setLinks(linksConnected)
      getReleasesPublishedByUser()
    } else {
      setLinks(linksNotConnected)
    }
  }, [wallet?.connected])

  useEffect(() => {
    if (wallet?.connected) {
      setUserPublishedReleasesCount(filterReleasesPublishedByUser().length)
      setUserCollectionReleasesCount(filterReleasesUserCollection().length)
    }
  }, [releaseState, collection])

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    setDrawerOpen(open)
  }

  const list = () => (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <StyledList disablePadding>
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
              return (
                <NavLink
                  className={`${classes.drawerLink}`}
                  to={`${link === 'home' ? '/' : `/${link}`}`}
                  activeClassName={`${classes.drawerLink} ${classes.drawerLink}--active  `}
                  key={link}
                >
                  <ListItem button key={link}>
                    <ListItemText primary={link} />
                  </ListItem>
                </NavLink>
              )
          }
        })}
      </StyledList>
    </Box>
  )

  return (
    <div>
      {
        <Box key={'left'}>
          <StyledMenuButton onClick={toggleDrawer(true)}>
            <Icon>
              <img src={hamburger} height={25} width={25} />
            </Icon>
          </StyledMenuButton>
          <StyledDrawer
            anchor={'left'}
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            BackdropProps={{ invisible: true }}
          >
            {list()}
          </StyledDrawer>
        </Box>
      }
    </div>
  )
}

const PREFIX = 'NavDrawer'

const classes = {
  toggle: `${PREFIX}-toggle`,
  list: `${PREFIX}-list`,
  drawerLink: `${PREFIX}-drawerLink`,
}

const StyledDrawer = styled(Drawer)(() => ({
  '& .MuiPaper-root': {
    width: 400,
  },
}))

const StyledList = styled(List)(({ theme }) => ({
  padding: `${theme.spacing(6, 4, 0, 4)} !important`,
  '& .MuiListItem-root': {
    padding: '5px 0',
    '&:hover': {
      backgroundColor: theme.palette.transparent,
    },
    '& .MuiListItemText-root': {
      margin: 0,
    },
  },
}))

const StyledMenuButton = styled(Button)(({ theme }) => ({
  padding: '0px !important',
  '&:hover': {
    backgroundColor: `${theme.palette.transparent} !important`,
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.black,
  },
}))

export default NavDrawer
