import React from 'react'
import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'
import Slider from 'react-slick'
import 'react-multi-carousel/lib/styles.css'
import Typography from '@mui/material/Typography'
import ninaCommon from 'nina-common'
import { Link } from 'react-router-dom'
import SmoothImage from 'react-smooth-image'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
const { Dots } = ninaCommon.components

const RecentlyPublished = (props) => {
  const { releases } = props

  const responsiveSettings = [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        initialSlide: 2,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
  ]

  const CustomNextArrow = ({ onClick }) => (
    <NavigateNextIcon
      className="sliderArrow sliderArrow--right"
      onClick={onClick}
    />
  )
  const CustomPrevArrow = ({ onClick }) => (
    <NavigateBeforeIcon
      className="sliderArrow sliderArrow--left"
      onClick={onClick}
    />
  )

  if (releases === undefined || releases.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '250px',
        }}
      >
        <Dots size="80px" />
      </Box>
    )
  }
  return (
    <RecentlyPublishedWrapper>
      {releases?.length > 0 && (
        <Slider
          dots="false"
          infinite="true"
          speed={1500}
          autoplay="true"
          responsive={responsiveSettings}
          autoplaySpeed={2500}
          slidesToShow={3}
          slidesToScroll={1}
          alignItems="left"
          nextArrow={<CustomNextArrow />}
          prevArrow={<CustomPrevArrow />}
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
              <ReleaseSlideWrapper key={i}>
                <ReleaseSlide key={i}>
                  <Link to={'/releases/' + release.releasePubkey}>
                    <SmoothImage src={imageUrl} />
                  </Link>
                  {availability}
                  <ReleaseCopy sx={{ display: 'flex' }}>
                    <Typography variant="body2">
                      {release.metadata.properties.artist},{' '}
                    </Typography>{' '}
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      {release.metadata.properties.title}
                    </Typography>
                  </ReleaseCopy>
                </ReleaseSlide>
              </ReleaseSlideWrapper>
            )
          })}
        </Slider>
      )}
    </RecentlyPublishedWrapper>
  )
}

const RecentlyPublishedWrapper = styled(Box)(({ theme }) => ({
  '& .sliderArrow': {
    top: '-12% !important',
    position: 'absolute',
    cursor: 'pointer',
    '&--right': {
      right: '25px',
      [theme.breakpoints.down('md')]: {
        right: '9px',
      },
    },
    '&--left': {
      right: '70px',
      [theme.breakpoints.down('md')]: {
        right: '50px',
      },
    },
  },
  '& .MuiSvgIcon-root': {
    [theme.breakpoints.down('md')]: {
      top: '-21% !important',
    },
  },
}))

const ReleaseSlideWrapper = styled(Box)(() => ({
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
  '& .MuiSvgIcon-root': {
    border: '2px solid red !important',
  },
}))

const ReleaseSlide = styled(Box)(({ theme }) => ({
  textAlign: 'left',
  padding: '0 30px',
  margin: 'auto',
  '& a': {
    width: '100%',
  },

  [theme.breakpoints.down('md')]: {
    width: '135px',
    padding: '0',
    paddingLeft: '1px',
    margin: '0',
  },
}))

const ReleaseCopy = styled(Box)(() => ({
  '& p': {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    maxWidth: '100%',
    padding: '10px 0 4px',
  },
}))
export default RecentlyPublished
