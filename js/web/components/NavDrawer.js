import React, { useState, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import { useWallet } from '@solana/wallet-adapter-react'
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button'
import { Typography, Box } from '@mui/material'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Link from 'next/link'
import { Icon } from "@material-ui/core";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faInstagramSquare } from '@fortawesome/free-brands-svg-icons'
import CloseIcon from '@mui/icons-material/Close'
import Image from 'next/image'

const linksConnected = [
  'home',
  'all Releases',
  'collection',
  'releases',
  'upload',
  'faq',
  'radio',
  'the soft lp',
]

const linksNotConnected = [
  'home',
  'all Releases',
  'upload',
  'faq',
  'radio',
  'the soft lp',
]

const NavDrawer = () => {
  const wallet = useWallet()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [links, setLinks] = useState(linksNotConnected)

  useEffect(() => {
    if (wallet?.connected) {
      setLinks(linksConnected)
    } else {
      setLinks(linksNotConnected)
    }
  }, [wallet?.connected])

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
      <CloseIcon
        fontSize="large"
        onClick={toggleDrawer}
        sx={{ padding: '15px 15px' }}
      />
      <StyledList disablePadding>
        {links.map((link) => {
          switch (link) {
            case 'collection':
              return (
                <Link
                  className={`${classes.drawerLink}`}
                  href={`/${link}`}
                  activeClassName={`${classes.drawerLink} ${classes.drawerLink}--active  `}
                  key={link}
                  passHref
                >
                  <ListItem button key={link}>
                    <StyledListItemText primary={`your ${link}`} />
                  </ListItem>
                </Link>
              )
            case 'releases':
              return (
                <Link
                  className={`${classes.drawerLink}`}
                  href={`/releases/user`}
                  activeClassName={`${classes.drawerLink} ${classes.drawerLink}--active  `}
                  key={link}
                  passHref
                >
                  <ListItem button key={link}>
                    <StyledListItemText primary={`your ${link}`} />
                  </ListItem>
                </Link>
              )
            case 'the soft lp':
              return (
                <ListItem button key={link}>
                  <StyledListItemText>
                    <a
                      href="https://softlp.nina.market"
                      target="_blank"
                      rel="noreferrer"
                      className={`${classes.drawerLink}`}
                      passHref
                    >
                      The Soft LP
                    </a>
                  </StyledListItemText>
                </ListItem>
              )
            case 'radio':
              return (
                <ListItem button key={link}>
                  <StyledListItemText>
                    <a
                      href="https://radio.ninaprotocol.com"
                      target="_blank"
                      rel="noreferrer"
                      className={`${classes.drawerLink}`}
                      passHref
                    >
                      Nina Radio
                    </a>
                  </StyledListItemText>
                </ListItem>
              )
            case 'faq':
              return (
                <ListItem button key={link}>
                  <StyledListItemText>
                    <a
                      href="https://nina-protocol.notion.site/nina-protocol/Nina-Protocol-FAQs-6aaeb02de9f5447494cc9dc304ffb612"
                      target="_blank"
                      rel="noreferrer"
                      className={`${classes.drawerLink}`}
                      passHref
                    >
                      Faq
                    </a>
                  </StyledListItemText>
                </ListItem>
              )
            case 'all Releases':
              return (
                <Link
                  className={`${classes.drawerLink}`}
                  href={`/releases`}
                  activeClassName={`${classes.drawerLink} ${classes.drawerLink}--active  `}
                  key={link}
                  passHref
                >
                  <ListItem button key={link}>
                    <StyledListItemText primary="All Releases" />
                  </ListItem>
                </Link>
              )

            default:
              return (
                <Link
                  className={`${classes.drawerLink}`}
                  href={`${
                    link === 'home' ? '/' : `/${link.replace(' ', '')}`
                  }`}
                  activeClassName={`${classes.drawerLink} ${classes.drawerLink}--active  `}
                  key={link}
                  passHref
                >
                  <ListItem button key={link}>
                    <StyledListItemText primary={link} />
                  </ListItem>
                </Link>
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
              <Image src={'/hamburger.svg'} height={25} width={25} />
            </Icon>
          </StyledMenuButton>
          <StyledDrawer
            anchor={'left'}
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            BackdropProps={{ invisible: true }}
          >
            {list()}

            <DrawerFooter>
              <Box display="flex">
                <a
                  href="https://twitter.com/ninaprotocol"
                  target="_blank"
                  rel="noreferrer"
                  style={{ paddingRight: '15px' }}
                >
                  <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a
                  href="https://discord.gg/ePkqJqSBgj"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon icon={faDiscord} />
                </a>
                <a
                  href="https://www.instagram.com/ninaprotocol/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon icon={faInstagramSquare} />
                </a>
              </Box>

              <Typography variant="subtitle1">
                © 2022 Nina Protocol Corp
              </Typography>
            </DrawerFooter>
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

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: 436,
    [theme.breakpoints.down('md')]: {
      width: '100vw',
    },
  },
}))

const StyledList = styled(List)(({ theme }) => ({
  padding: `${theme.spacing('100px', 4, 0, 4)} !important`,
  '& .MuiListItem-root': {
    padding: '5px 0',
    '&:hover': {
      backgroundColor: theme.palette.transparent,
    },
    '& .MuiListItemText-root': {
      margin: 0,
      '& span': {
        textTransform: 'capitalize',
        fontSize: '18px !important',
        lineHeight: '20.7px !important',
      },
    },
  },
}))

const StyledMenuButton = styled(Button)(({ theme }) => ({
  padding: '0px !important',
  zIndex: '10',
  '&:hover': {
    backgroundColor: `${theme.palette.transparent} !important`,
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.black,
  },
}))

const DrawerFooter = styled(Box)(() => ({
  position: "absolute",
  bottom: "10px",
  width: "75%",
  left: "60px",
  transform: "translateY(-50%)",
  display: "flex",
  justifyContent: "space-between",
  "& a": {
    paddingRight: "15px",
    "& svg": {
      height: "15px !important",
    },
  },
}))

const StyledListItemText = styled(ListItemText)(() => ({
  '&:hover': {
    opacity: 0.5,
  },
}))

export default NavDrawer
