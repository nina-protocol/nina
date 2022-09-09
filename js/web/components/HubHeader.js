import { Toolbar, Grid, Box } from '@mui/material'
import Image from 'next/image'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import Link from 'next/link'
import { useState, useEffect, createElement, Fragment } from 'react'
import {unified} from "unified";
import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import rehypeExternalLinks from "rehype-external-links";

const { getImageFromCDN, loader } = imageManager

const HubHeader = ({ hubImage, hubName, description, hubUrl, hubDate }) => {
  const [hubDescription, setHubDescription] = useState()
  useEffect(() => {
    if (description.includes('<p>')) {
      unified()
        .use(rehypeParse, {fragment: true})
        .use(rehypeSanitize)
        .use(rehypeReact, {
          createElement,
          Fragment,
        })
        .use(rehypeExternalLinks, {
          target: false,
          rel: ["nofollow", "noreferrer"],
        })
        .process(
          JSON.parse(description).replaceAll(
            "<p><br></p>",
            "<br>"
          )
        )
        .then((file) => {
          setHubDescription(file.result);
        });
    } else {
      setHubDescription(description)
    }
  }, [description]);
  const descriptionFilter = (desc) => {
    return desc?.length > 24 ? `${desc.substring(0,24)}...` : desc
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1,
        m: 1,
      }}
    >
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

      {hubName && <Box sx={{ px: 2 }}>{hubName}</Box>}
      {description && <Box sx={{ pr: 2 }}>{descriptionFilter(hubDescription)}</Box>}
      {hubUrl && (
        <Box>
          <Link href={hubUrl}>
            <a>{hubUrl.substring(8, hubUrl.length)}</a>
          </Link>
        </Box>
      )}
    </Box>
  )
}

export default HubHeader
