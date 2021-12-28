import { Link } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { Typography } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

const Footer = () => {
  return (
    <StyledBox className={classes.root}>
      <Box className={classes.info}>
        <Link to="/about">About</Link>
        <Typography className={classes.copyright}>
          © 2021 Nina Protocol Corp
        </Typography>
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
    </StyledBox>
  )
}
const PREFIX = 'Footer'

const classes = {
  root: `${PREFIX}-root`,
  info: `${PREFIX}-info`,
  copyright: `${PREFIX}-copyright`,
  socials: `${PREFIX}-socials`,
  icon: `${PREFIX}-icon`,
}

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    width: '100%',
    position: 'absolute',
    bottom: '0',
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      backgroundColor: `${theme.palette.white}`,
    },
  },

  [`& .${classes.info}`]: {
    display: 'flex',
    padding: `${theme.spacing(1, 2)}`,
    fontSize: '10px',
    '& a': {
      color: `${theme.palette.black}`,
      textDecoration: 'none',
      '&:hover': {
        color: `${theme.palette.blue}`,
      },
    },
  },

  [`& .${classes.copyright}`]: {
    fontSize: '10px',
    paddingLeft: '20px',
  },

  [`& .${classes.socials}`]: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: '10px',
  },

  [`& .${classes.icon}`]: {
    color: `${theme.palette.black}`,
    padding: `${theme.spacing(1, 1)}`,
    '&:hover': {
      color: `${theme.palette.blue}`,
    },
  },
}))

export default Footer
