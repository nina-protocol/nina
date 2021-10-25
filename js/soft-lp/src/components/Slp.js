import React from 'react'
import { styled } from '@mui/material/styles'

import SlpTabs from './SlpTabs'

const releasePubkey = process.env.REACT_APP_RELEASE_PUBKEY

const Slp = (props) => {
  const { activeIndex } = props

  return (
    <Root>
      <div className={`${classes.release}`}>
        <div className={classes.releaseControls}>
          <SlpTabs releasePubkey={releasePubkey} activeIndex={activeIndex} />
        </div>
      </div>
    </Root>
  )
}

const PREFIX = 'Slp'

const classes = {
  release: `${PREFIX}-release`,
  releaseControls: `${PREFIX}-releaseControls`,
}

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.release}`]: {
    width: '808px',
    margin: 'auto',
    display: 'flex',
    zIndex: '9',
    [theme.breakpoints.down('md')]: {
      width: '98vw',
      marginBottom: theme.spacing(6),
      marginTop: '0',
      maxHeight: '100vh',
      position: 'absolute',
      top: '60px',
    },
  },

  [`& .${classes.releaseControls}`]: {
    margin: 'auto',
    height: '100%',
    width: '100%',
  },
}))

export default Slp
