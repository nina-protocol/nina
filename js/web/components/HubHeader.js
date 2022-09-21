import Image from 'next/image'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import Link from 'next/link'
import { useState, useEffect, createElement, Fragment } from 'react'
import { Typography } from '@mui/material'
import { styled } from '@mui/system'
import { Box } from '@mui/system'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'

const { getImageFromCDN, loader } = imageManager

const HubHeader = ({ hubImage, hubName, description, hubUrl, hubDate }) => {
  const [hubDescription, setHubDescription] = useState(undefined)
  useEffect(() => {
    if (description.includes('<p>')) {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeSanitize)
        .use(rehypeReact, {
          createElement,
          Fragment,
        })
        .use(rehypeExternalLinks, {
          target: false,
          rel: ['nofollow', 'noreferrer'],
        })
        .process(JSON.parse(description).replaceAll('<p><br></p>', '<br>'))
        .then((file) => {
          setHubDescription(file.result)
        })
    } else {
      setHubDescription(description)
    }
  }, [description])
  const descriptionFilter = (desc) => {
    return desc?.length > 24 ? `${desc.substring(0, 24)}...` : desc
  }
  return (
    <ResponsiveHubHeader >
      <Box sx={{ width: '100px' }}>
        <Image
          height={'100%'}
          width={'100%'}
          layout="responsive"
          src={getImageFromCDN(hubImage, 400, new Date(Date.parse(hubDate)))}
          alt={hubName}
          priority={true}
          loader={loader}
        />
      </Box>

      {hubName && (
        <Link href={hubUrl}>
          <a>
            <Typography sx={{ px: 2 }}>{hubName}</Typography>
          </a>
        </Link>
      )}
      {description && (
        <Typography sx={{ pr: 2 }}>
          {descriptionFilter(hubDescription)}
        </Typography>
      )}
    </ResponsiveHubHeader>
  )
}

const ResponsiveHubHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '115px',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'start',
  py: 1,
  mb: 1,
  [theme.breakpoints.down('md')]: {
    alignItems: 'left',
    paddingLeft:'15px',
    paddingRight: '15px'
  },
}))
 
export default HubHeader
