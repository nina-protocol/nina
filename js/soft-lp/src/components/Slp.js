import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import SlpTabs from './SlpTabs'

const releasePubkey = process.env.REACT_APP_RELEASE_PUBKEY

const Slp = (props) => {
  const classes = useStyles()
  const { activeIndex } = props

  return (
    <>
      <div className={`${classes.release}`}>
        <div className={classes.releaseControls}>
          <SlpTabs releasePubkey={releasePubkey} activeIndex={activeIndex} />
        </div>
      </div>
    </>
  )
}

const useStyles = makeStyles((theme) => ({
  release: {
    width: '808px',
    margin: 'auto',
    display: 'flex',
    zIndex: '9',
    [theme.breakpoints.down('sm')]: {
      width: '98vw',
      marginBottom: `${theme.spacing(6)}px`,
      marginTop: '0',
      maxHeight: '100vh',
      position: 'absolute',
      top: '60px',
    },
  },
  releaseControls: {
    margin: 'auto',
    height: '100%',
    width: '100%',
  },
}))

export default Slp
