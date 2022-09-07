import { Toolbar, Grid, Box } from '@mui/material'
import Image from 'next/image'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import Link from 'next/link'
const { getImageFromCDN, loader } = imageManager

const HubHeader = ({ hubImage, hubName, hubDescription, hubUrl, hubDate }) => {
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
      <Box sx={{ width: '50px', height: '50px' }}>
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
      {hubDescription && <Box sx={{ pr: 2 }}>{hubDescription}</Box>}
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
