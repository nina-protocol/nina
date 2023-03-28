import React, { useContext } from 'react'
import { styled } from '@mui/material/styles'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import Button from '@mui/material/Button'
import Link from 'next/link'
const { getImageFromCDN, loader } = imageManager
const ReleaseTileList = (props) => {
  const { releases } = props
  const { updateTrack, addTrackToQueue, isPlaying, setIsPlaying, track } =
    useContext(Audio.Context)

  return (
    <TileBox>
      <TileGrid>
        {releases.map((release, i) => {
          if (
            (release.metadata.properties.title.length > 20 &&
              release.metadata.properties.title.indexOf(' ') === -1) ||
            release.metadata.properties.title.length > 250
          ) {
            release.metadata.properties.title =
              release.metadata.properties.title.substring(0, 20) + '...'
          }

          return (
            <Tile key={i}>
              <HoverCard>
                <Link href={`/${release.releasePubkey}`} key={i}>
                  <a>
                    <CardCta>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (
                            isPlaying &&
                            track.releasePubkey === release.releasePubkey
                          ) {
                            setIsPlaying(false)
                          } else {
                            updateTrack(release.releasePubkey, true, true)
                          }
                        }}
                      >
                        {isPlaying &&
                        track.releasePubkey === release.releasePubkey ? (
                          <PauseCircleOutlineOutlinedIcon
                            sx={{ color: 'white' }}
                          />
                        ) : (
                          <PlayCircleOutlineOutlinedIcon
                            sx={{ color: 'white' }}
                          />
                        )}
                      </Button>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          addTrackToQueue(release.releasePubkey)
                        }}
                      >
                        <ControlPointIcon sx={{ color: 'white' }} />
                      </Button>
                    </CardCta>
                    {release.metadata.image && (
                      <Image
                        width={100}
                        height={100}
                        layout="responsive"
                        containerStyles={{
                          position: 'absolute',
                          left: '0',
                          top: '0',
                          zIndex: '1',
                        }}
                        src={getImageFromCDN(
                          release.metadata.image,
                          400,
                          new Date(release.tokenData.releaseDatetime)
                        )}
                        priority={!isMobile}
                        loader={loader}
                      />
                    )}
                  </a>
                </Link>
              </HoverCard>
              <Box sx={{ padding: '10px 0 0' }}>
                <ReleaseName>
                  {release.metadata.properties.artist} -{' '}
                  {release.metadata.properties.title}
                </ReleaseName>
              </Box>
            </Tile>
          )
        })}
      </TileGrid>
    </TileBox>
  )
}

const TileGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridColumnGap: '30px',
  gridRowGap: '30px',
  maxWidth: '960px',
  margin: 'auto',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    paddingBottom: '120px',
  },
}))

const Tile = styled(Box)(({ theme }) => ({
  textAlign: 'left',
  maxWidth: '100%',
  [theme.breakpoints.down('md')]: {
    maxWidth: '37vw',
  },
}))

const HoverCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  minHeight: '300px',
  [theme.breakpoints.down('md')]: {
    minHeight: '144px',
  },
}))

const CardCta = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backgroundColor: theme.palette.overlay,
  zIndex: '2',
  opacity: '0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&:hover': {
    opacity: '1',
    cursor: 'pointer',
  },
  [theme.breakpoints.down('md')]: {
    display: 'none',
    zIndex: '-1',
  },
}))

const ReleaseName = styled(Typography)(() => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}))

const TileBox = styled(Box)(({ theme }) => ({
  '& a': {
    color: theme.palette.black,
  },
}))

export default ReleaseTileList
