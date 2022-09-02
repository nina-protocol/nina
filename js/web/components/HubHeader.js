import { Toolbar, Grid, Box } from '@mui/material'
import Image from 'next/image'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'

const { getImageFromCDN, loader } = imageManager

const HubHeader = ({ hubImage, hubName, hubDescription, hubUrl, hubDate }) => {
  console.log('hubDate', new Date(Date.parse(hubDate)))
  console.log('hubImage', hubImage)
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'end',
        p: 1,
        m: 1,
      }}
    >
      <Box sx={{ width: '100px', height: '100px' }}>
        <Image
          height={"100%"}
          width={"100%"}
          layout="responsive"
          src={getImageFromCDN(hubImage, 400, new Date(Date.parse(hubDate)))}
          alt={hubName}
          priority={true}
          loader={loader}
        />
      </Box>

      {hubName && <Box sx={{px:2}}>{hubName}</Box>}
      {hubDescription  && <Box sx={{pr:2}}>{hubDescription}</Box>}
      {hubUrl && <Box >{hubUrl}</Box>}
    </Box>
  )
}

export default HubHeader
