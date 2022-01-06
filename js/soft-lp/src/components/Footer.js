import { Link } from 'react-router-dom'
import Box from '@material-ui/core/Box'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

const Footer = () => {
  const classes = useStyles()

  return (
    <Box className={classes.root}>
      <Box className={classes.info}>
        <Link to="/about">About</Link>
        <a href="https://nina.market"
          target="_blank"
          rel="noreferrer"
        >
          <Typography className={classes.copyright}>
            Powered by Nina.
          </Typography>
        </a>
      </Box>

      <Box className={classes.socials}>
        <a
          href="https://twitter.com/nina_market_"
          target="_blank"
          rel="noreferrer"
          className={classes.icon}
        >
          <FontAwesomeIcon icon={faTwitter} />
        </a>
        <a
          href="https://discord.gg/EqaCvgRn"
          target="_blank"
          rel="noreferrer"
          className={classes.icon}
        >
          <FontAwesomeIcon icon={faDiscord} />
        </a>
      </Box>
    </Box>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    position: 'absolute',
    bottom: '0',
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      backgroundColor: `${theme.vars.white}`,
    },
  },
  info: {
    display: 'flex',
    padding: `${theme.spacing(1, 2)}`,
    fontSize: '10px',
    '& a': {
      color: `${theme.vars.black}`,
      textDecoration: 'none',
      '&:hover': {
        color: `${theme.vars.blue}`,
      },
    },
  },
  copyright: {
    fontSize: '10px',
    paddingLeft: '20px',
  },
  socials: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: '10px',
  },
  icon: {
    color: `${theme.vars.black}`,
    padding: `${theme.spacing(1, 1)}`,
    '&:hover': {
      color: `${theme.vars.blue}`,
    },
  },
}))

export default Footer
