import { useEffect, useRef } from 'react'
import Slider from 'react-slick'
import 'react-tabs/style/react-tabs.css'
import { Box } from '@material-ui/core'
import Fade from '@material-ui/core/Fade'
import { makeStyles } from '@material-ui/core/styles'
import NINA1 from '../assets/NINA-1-tu.png'
import NINA2 from '../assets/NINA-2-tu.png'
import NINA3 from '../assets/NINA-3-tu.png'

const SlpSlider = () => {
  const classes = useStyles()
  const sliderRef = useRef(null)
  const desktopSliderRef = useRef(null)

  const handleScroll = (e) => {
    const top = desktopSliderRef.current.scrollTop
    desktopSliderRef.current.scrollTo({ top: top + e.deltaY })
  }

  useEffect(() => {
    const watchScroll = () => {
      window.addEventListener('mousewheel', handleScroll)
    }

    watchScroll()
    return () => {
      window.removeEventListener('mousewheel', handleScroll)
    }
  })

  const next = () => {
    sliderRef.current.slickNext()
  }

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    touchMove: true,
    customPaging: () => <span className={classes.slpDot}></span>,
  }

  return (
    <>
      <div className={classes.slpSliderContainer}>
        <Slider {...settings} ref={sliderRef}>
          <Fade in={true} timeout={750}>
            <Box className={classes.slpSlide} onClick={next}>
              <img src={NINA1} className={classes.slpSlideImage} />
            </Box>
          </Fade>
          <Fade in={true} timeout={750}>
            <Box className={classes.slpSlide} onClick={next}>
              <img src={NINA2} className={classes.slpSlideImage} />
            </Box>
          </Fade>
          <Fade in={true} timeout={750}>
            <Box className={classes.slpSlide} onClick={next}>
              <img src={NINA3} className={classes.slpSlideImage} />
            </Box>
          </Fade>
        </Slider>
      </div>

      <Box className={classes.desktopSlider} ref={desktopSliderRef}>
        <Box className={classes.desktopSliderScroll}>
          <Box className={classes.imageWrapper}>
            <img src={NINA2} />
          </Box>
          <Box className={classes.imageWrapper}>
            <img src={NINA1} />
          </Box>
          <Box className={classes.imageWrapper}>
            <img src={NINA3} />
          </Box>
          <Box className={classes.bump}></Box>
        </Box>
      </Box>
    </>
  )
}

const useStyles = makeStyles((theme) => ({
  slpSliderContainer: {
    width: '100%',
    margin: 'auto',
    display: 'block',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
    '& .slick-dots .slick-active span': {
      opacity: '1',
    },
  },
  slpDot: {
    height: '8px',
    width: '8px',
    backgroundColor: `${theme.vars.blue}`,
    borderRadius: '50%',
    display: 'inline-block',
    opacity: '19%',
  },
  slpSlide: {
    width: '100%',
    display: 'flex',
  },
  slpSlideImage: {
    height: '100%',
    margin: 'auto',
    width: '400px',
    [theme.breakpoints.down('sm')]: {
      width: '240px',
    },
  },
  desktopSlider: {
    height: '100vh',
    overflow: 'scroll',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  desktopSliderScroll: {
    height: '100vh',
    marginTop: '20vh',
  },
  imageWrapper: {
    width: '100%',
    paddingBottom: '20px',
    '& img': {
      width: '100%',
    },
  },
  bump: {
    height: '12vh',
  },
}))

export default SlpSlider
