import React, { useContext, useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { isMobile } from 'react-device-detect'
import Slider from 'react-slick'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import Image from 'next/image'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'

import Dots from './Dots'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
const { getImageFromCDN, loader } = imageManager

const HubSlider = () => {
  const { getHubs, hubState, featuredHubs, setFeaturedHubs } = useContext(
    Hub.Context
  )
  const { getSubscriptionsForUser } = useContext(Nina.Context)
  const [featuredHubPublicKeys, setFeaturedHubPublicKeys] = useState()

  const shuffle = (array) => {
    let currentIndex = array.length,
      randomIndex

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--

      // And swap it with the current element.
      ;[array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ]
    }

    return array
  }

  useEffect(() => {
    const fetchFeaturedHubs = async () => {
      await getHubs()
      const response = await getSubscriptionsForUser(
        '7g2euzpRxm2A9kgk4UJ9J5ntUYvodTw4s4m7sL1C8JE'
      )
      const publicKeys = response.filter((sub) => {
        return sub.subscriptionType === 'hub'
      })
      setFeaturedHubPublicKeys(publicKeys)
    }
    fetchFeaturedHubs()
  }, [])

  useEffect(() => {
    if (featuredHubPublicKeys) {
      const featured = []
      Object.values(featuredHubPublicKeys).forEach((sub) => {
        const hub = hubState[sub.to]
        if (hub) {
          featured.push(hub)
        }
      })
      setFeaturedHubs(shuffle(featured))
    }
  }, [featuredHubPublicKeys, hubState])

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
  if (!featuredHubs) {
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
    <HubSliderWrapper>
      {featuredHubs?.length > 0 && (
        <Slider
          dots={false}
          infinite={true}
          speed={1000}
          responsive={responsiveSettings}
          slidesToShow={3}
          slidesToScroll={3}
          alignItems="left"
          nextArrow={<CustomNextArrow />}
          prevArrow={<CustomPrevArrow />}
        >
          {featuredHubs?.map((hub, i) => {
            const imageUrl = hub?.data?.image
            return (
              <HubSlideWrapper key={i}>
                <HubSlide key={i}>
                  {imageUrl && (
                    <Link href={`/hubs/${hub.handle}`}>
                      <a>
                        <Image
                          src={getImageFromCDN(
                            imageUrl,
                            400,
                            new Date(Date.parse(hub.datetime))
                          )}
                          loader={loader}
                          height={100}
                          width={100}
                          layout="responsive"
                          priority={!isMobile}
                        />
                      </a>
                    </Link>
                  )}
                  <HubCopy sx={{ display: 'flex' }}>
                    <Typography variant="body2">
                      {hub?.data?.displayName}
                    </Typography>
                  </HubCopy>
                </HubSlide>
              </HubSlideWrapper>
            )
          })}
        </Slider>
      )}
    </HubSliderWrapper>
  )
}

const HubSliderWrapper = styled(Box)(({ theme }) => ({
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

const HubSlideWrapper = styled(Box)(() => ({
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
  '& .MuiSvgIcon-root': {
    border: '2px solid red !important',
  },
}))

const HubSlide = styled(Box)(({ theme }) => ({
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

const HubCopy = styled(Box)(() => ({
  '& p': {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    maxWidth: '100%',
    padding: '10px 0 4px',
  },
}))
export default HubSlider
