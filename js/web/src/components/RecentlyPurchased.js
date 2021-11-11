import React from 'react'
import { styled } from '@mui/material/styles'
import 'react-multi-carousel/lib/styles.css'
import { Typography, Box } from '@mui/material'
import { Link } from 'react-router-dom'
import SmoothImage from 'react-smooth-image'
import CircularProgress from '@mui/material/CircularProgress'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
import Button from '@mui/material/Button';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';


const RecentlyPurchased = (props) => {
  const { releases } = props
  if (releases === undefined || releases.length === 0) {
    return (
      <RecentlyPurchasedContainer
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress color="black" />
      </RecentlyPurchasedContainer>
    )
  }

  const responsive = {
    desktop: {
      breakpoint: {max: 3000, min: 1024},
      items: 1,
    },
    tablet: {
      breakpoint: {max: 1024, min: 464},
      items: 1,
    },
    mobile: {
      breakpoint: {max: 464, min: 0},
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  }

  const buttonStyle = {
    position: 'absolute',
    color: 'black',
    backgroundColor: 'red !important',
    '&:hover': {
      backgroundColor: 'black !important'
    },
    '& ::before': {
      display: 'none'
    }
  }

  const CustomRightArrow = ({onClick}) => {
    return (
      <Button disableRipple style={{right: '-10px', ...buttonStyle}}>
        <KeyboardArrowRightIcon fontSize="large" onClick={() => onClick()} />
      </Button>
    )

  };
  const CustomLeftArrow = ({onClick}) => {
    return (
      <Button disableRipple style={{display: 'none', ...buttonStyle}}>
        <KeyboardArrowLeftIcon fontSize="large" onClick={() => onClick()} />
      </Button>
    )
  };

  return (
    <>
      <RecentlyPurchasedContainer>
        <Typography align="left" className={classes.sectionHeader}>Market Movers</Typography>
        <Box>
          {releases?.length > 0 && 
          <Carousel
            showDots={false}
            showArrows={false}
            draggable={true}
            responsive={responsive}
            infinite={true}
            autoPlay={true}
            autoPlaySpeed={2000}
            keyBoardControl={true}
            transitionDuration={500}
            slidesToSlide={1}
            containerClass="carousel-container"
            removeArrowOnDeviceType={['tablet', 'mobile']}
            customRightArrow={<CustomRightArrow />}
            customLeftArrow={<CustomLeftArrow />}

          >
            {releases.map((release, i) => {

              const releaseDate = new Date(release.tokenData.releaseDatetime.toNumber() * 1000)
              const dateNow = new Date()
              const differenceTime = dateNow.getTime() - releaseDate.getTime()
              const dayDifference = Math.round(differenceTime / (1000 * 3600 * 24))

              const sales = (release.tokenData.totalSupply.toNumber() - release.tokenData.remainingSupply.toNumber()) + release.tokenData.exchangeSaleCounter.toNumber()
              const imageUrl = release.metadata.image

              const artistInfo = (
                <Typography variant="body2" align="left">
                  {release.metadata.properties.artist},{' '}
                  {release.metadata.properties.title}
                </Typography>
              )
              const availability = (
                <Typography variant="body2" align="left">
                  {release.tokenData.remainingSupply.toNumber()} /{' '}
                  {release.tokenData.totalSupply.toNumber()}
                </Typography>
              )


              return(
                <Slide key={i}>
                  <Link
                    to={'/release/' + release.releasePubkey}
                    style={{ width: '400px' }}
                  >
                    <SmoothImage src={imageUrl} imageStyles={{ minWidth: '400px' }} />
                  </Link>
                  <Copy sx={{paddingLeft: 2}}>
                    <Typography align="left" variant="h3" color="blue">{sales} Releases were sold in the last {dayDifference} days</Typography>
                    {availability}
                    {artistInfo}
                  </Copy>
                </Slide>
              )

            })}
          </Carousel>
          }
        </Box>
      </RecentlyPurchasedContainer>
    </>
  )
}

const PREFIX = 'recentlyPurchased'

const classes = {
  sectionHeader: `${PREFIX}-sectionHeader`,
}

const RecentlyPurchasedContainer = styled(Box)(({ theme }) => ({
  minHeight: '400px',
  marginLeft: '35%',
  flexShrink: '0',
  alignItems: 'center',
  '& a': {
    minWidth: '400px',
  },

  [`& .${classes.sectionHeader}`]: {
    fontWeight: '700 ',
    paddingBottom: `${theme.spacing(1)}`,
  },
}))

const Slide = styled(Box)(() => ({
  display: 'flex',
  // alignItems: 'center'
}))

const Copy = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',

  '& *': {
    paddingBottom: '5px',
  },
}))

export default RecentlyPurchased
