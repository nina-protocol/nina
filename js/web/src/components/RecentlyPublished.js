import React from 'react'
import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
import Typography from '@mui/material/Typography'
import ninaCommon from 'nina-common'
import { Link } from 'react-router-dom'
import SmoothImage from 'react-smooth-image'
const { Dots } = ninaCommon.components

const RecentlyPublished = (props) => {
  const { releases } = props
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2,
      slidesToSlide: 2,
    },
  }

  // const buttonStyle = {
  //   position: 'absolute',
  //   color: 'black',
  //   backgroundColor: 'red !important',
  //   '&:hover': {
  //     backgroundColor: 'black !important',
  //   },
  //   '& ::before': {
  //     display: 'none',
  //   },
  // }

  if (releases === undefined || releases.length === 0) {
    return (
      <RecentlyPublishedContainer
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Dots size="80px" />
      </RecentlyPublishedContainer>
    )
  }
  return (
    <RecentlyPublishedContainer>
      {releases?.length > 0 && (
        <Carousel
          showDots={true}
          showArrows={false}
          draggable={true}
          swipeable={true}
          responsive={responsive}
          infinite={true}
          // autoPlay={true}
          autoPlaySpeed={2000}
          keyBoardControl={true}
          transitionDuration={1200}
          slidesToSlide={3}
          containerClass="carousel-container"
          removeArrowOnDeviceType={['tablet', 'mobile', 'desktop']}
        >
          {releases.map((release, i) => {
            const imageUrl = release.metadata.image
            const availability = (
              <Typography variant="body2" sx={{ paddingTop: '10px' }}>
                {release.tokenData.remainingSupply.toNumber()} /{' '}
                {release.tokenData.totalSupply.toNumber()}
              </Typography>
            )

            return (
              <ReleaseSlide key={i}>
                <Link to={'/releases/' + release.releasePubkey}>
                  <SmoothImage src={imageUrl} />
                </Link>
                {availability}
                <ReleaseCopy sx={{ display: 'flex' }}>
                  <Typography variant="body2">
                    {release.metadata.properties.artist},
                  </Typography>{' '}
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    {release.metadata.properties.title}
                  </Typography>
                </ReleaseCopy>
              </ReleaseSlide>
            )
          })}
        </Carousel>
      )}
    </RecentlyPublishedContainer>
  )
}

const RecentlyPublishedContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '250px',
  '& .carousel-container': {
    // border: '2px solid blue',/
    paddingBottom: '35px',
    '& li': {
      // border: '2px solid red',
      // display: 'flex',
      // justifyContent: 'center'
    },
  },
  '& .react-multi-carousel-dot-list': {
    marginTop: '100px',
    '& button': {
      border: 'none',
      height: '11px',
      width: '14px',
      backgroundColor: theme.palette.greyLight,
      marginRight: '20px',
    },
    '& .react-multi-carousel-dot--active button': {
      backgroundColor: theme.palette.blue,
    },
  },
}))

const ReleaseSlide = styled(Box)(({ theme }) => ({
  width: '250px',
  textAlign: 'left',
  paddingLeft: '1px',
  '& a': {
    width: '100%',
  },
  [theme.breakpoints.down('md')]: {
    width: '34vw',
  },
}))

const ReleaseCopy = styled(Box)(() => ({
  '& p': {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    maxWidth: '100%',
    padding: '10px 0 0',
  },
}))
export default RecentlyPublished
