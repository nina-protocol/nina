import { Box } from '@mui/system'
import { Button, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Link from 'next/link'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import Paper from '@mui/material/Paper'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import { useContext } from 'react'
import Image from 'next/image'
import { useSnackbar } from 'notistack'

const { getImageFromCDN, loader } = imageManager

const ProfileCollectionsOK = ({ profileCollection, onPlay, onQueue }) => {
  if (profileCollection.length === 0)
    return <Box>This address has no collection yet</Box>

  return profileCollection.map((release) => (
    <Box key={release.metadata.properties.name}>
      <ProfileCollection
        artist={release.metadata.properties.artist}
        title={release.metadata.properties.title}
        onPlay={onPlay}
        onQueue={onQueue}
        releasePubkey={release.releasePubkey}
        trackName={release.metadata.properties.name}
        image={release.metadata.image}
        date={release.metadata.date}
      />
    </Box>
  ))
}

const ProfileCollection = ({ profileCollection }) => {
    const {
      updateTrack,
      addTrackToQueue,
      isPlaying,
      setIsPlaying,
      track,
      playlist,
    } = useContext(Audio.Context)
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  
    const snackbarHandler = (message) => {
      const snackbarMessage = enqueueSnackbar(message, { persistent: 'true' })
      setTimeout(() => closeSnackbar(snackbarMessage), 1000)
    }
    const handlePlay = (e, releasePubkey) => {
      e.stopPropagation()
      e.preventDefault()
      if (isPlaying && track.releasePubkey === releasePubkey) {
        setIsPlaying(false)
      } else {
        updateTrack(releasePubkey, true, true)
      }
    }
  
    const handleQueue = (e, releasePubkey, title) => {
      e.stopPropagation()
      e.preventDefault()
      const isAlreadyQueued = playlist.some((entry) => entry.title === title)
      const filteredTrackName =
        title?.length > 12 ? `${title.substring(0, 12)}...` : title
      if (releasePubkey && !isAlreadyQueued) {
        addTrackToQueue(releasePubkey)
        snackbarHandler(`${filteredTrackName} successfully added to queue`)
      } else {
        snackbarHandler(`${filteredTrackName} already added to queue`)
      }
    }
    return (
      <>
       {profileCollection?.length === 0 && (
                <Box>No releases belong to this address</Box>
              )}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 'bold', borderBottom: 'none' }}
                ></TableCell>
                <TableCell
                  sx={{ fontWeight: 'bold', borderBottom: 'none' }}
                ></TableCell>
                <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>
                  Artist
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>
                  Title
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
             
              {profileCollection.map((release) => (
                <TableRow
                  hover
                  key={release.metadata.properties.name}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    height: '50px',
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Button
                      sx={{ cursor: 'pointer' }}
                      id={release.releasePubkey}
                      key={release.metadata.properties.title}
                      onClick={(e) =>
                        handleQueue(
                          e,
                          release.releasePubkey,
                          release.metadata.properties.title
                        )
                      }
                    >
                      <ControlPointIcon
                        sx={{ color: 'black' }}
                        key={release.metadata.properties.title}
                        onClick={(e) =>
                          handleQueue(
                            e,
                            release.releasePubkey,
                            release.metadata.properties.title
                          )
                        }
                      />
                    </Button>
                    <Button
                      sx={{
                        mr: 3,
                        pr: 3,
                        cursor: 'pointer',
                      }}
                      onClick={(e) => handlePlay(e, release.releasePubkey)}
                      id={release.releasePubkey}
                    >
                      {isPlaying &&
                      track.releasePubkey === release.releasePubkey ? (
                        <PauseCircleOutlineOutlinedIcon
                          sx={{ color: 'black' }}
                          onClick={(e) => handlePlay(e, release.releasePubkey)}
                          id={release.releasePubkey}
                        />
                      ) : (
                        <PlayCircleOutlineOutlinedIcon sx={{ color: 'black' }} />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: '50px' }}>
                      <Link href={`/${release.releasePubkey}`} passHref prefetch>
                        <a>
                          <Image
                            height={'100%'}
                            width={'100%'}
                            layout="responsive"
                            src={getImageFromCDN(
                              release.metadata.image,
                              400,
                              new Date(
                                Date.parse(release.metadata.properties.date)
                              )
                            )}
                            alt={release.metadata.properties.name}
                            priority={true}
                            loader={loader}
                          />
                        </a>
                      </Link>
                    </Box>
                  </TableCell>
                  <TableCell align="left">
                    {' '}
                    <Link href={`/${release.releasePubkey}`} passHref prefetch>
                      <a>{release.metadata.properties.artist} </a>
                    </Link>
                  </TableCell>
                  <TableCell align="left">
                    {' '}
                    <Link href={`/${release.releasePubkey}`} passHref prefetch>
                      <a>{release.metadata.properties.title} </a>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    )
  }



const ProfileCollectionHmm = ({
  artist,
  title,
  releasePubkey,
  trackName,
  image,
  date,
}) => {
  const {
    updateTrack,
    addTrackToQueue,
    isPlaying,
    setIsPlaying,
    track,
    playlist,
  } = useContext(Audio.Context)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const snackbarHandler = (message) => {
    const snackbarMessage = enqueueSnackbar(message, { persistent: 'true' })
    setTimeout(() => closeSnackbar(snackbarMessage), 1000)
  }

  const handleQueue = (e, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    const isAlreadyQueued = playlist.some((entry) => entry.title === title)
    const filteredTrackName =
      title?.length > 12 ? `${title.substring(0, 12)}...` : title
    if (releasePubkey && !isAlreadyQueued) {
      addTrackToQueue(releasePubkey)
      snackbarHandler(`${filteredTrackName} successfully added to queue`)
    } else {
      snackbarHandler(`${filteredTrackName} already added to queue`)
    }
  }
  const handlePlay = (e, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    if (isPlaying && track.releasePubkey === releasePubkey) {
      setIsPlaying(false)
    } else {
      updateTrack(releasePubkey, true, true)
    }
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '50vw',
        textAlign: 'left',
      }}
    >
      <Box sx={{ p: 1 }}>
        <Button
          sx={{ cursor: 'pointer' }}
          id={releasePubkey}
          key={trackName}
          onClick={(e) => handleQueue(e, releasePubkey)}
        >
          <ControlPointIcon
            sx={{ color: 'black' }}
            key={trackName}
            onClick={(e) => handleQueue(e, releasePubkey)}
          />
        </Button>
      </Box>
      <Box sx={{ mr: 3, pr: 3 }}>
        <Button
          sx={{
            cursor: 'pointer',
          }}
          onClick={(e) => handlePlay(e, releasePubkey)}
          id={releasePubkey}
        >
          {isPlaying && track.releasePubkey === releasePubkey ? (
            <PauseCircleOutlineOutlinedIcon
              sx={{ color: 'black' }}
              onClick={(e) => handlePlay(e, releasePubkey)}
              id={releasePubkey}
            />
          ) : (
            <PlayCircleOutlineOutlinedIcon sx={{ color: 'black' }} />
          )}
        </Button>
      </Box>

      <Box sx={{ width: '50px', height: 'auto', mr: 1, cursor: 'pointer' }}>
        <Link href={`/${releasePubkey}`} passHref prefetch>
          <a>
            <Image
              height={'100%'}
              width={'100%'}
              layout="responsive"
              src={getImageFromCDN(image, 400, new Date(Date.parse(date)))}
              alt={trackName}
              priority={true}
              loader={loader}
            />
          </a>
        </Link>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          width: '100%',
          cursor: 'pointer',
        }}
      >
        <Link href={`/${releasePubkey}`} passHref prefetch>
          <a>
            <Typography
              noWrap
              sx={{ cursor: 'pointer' }}
            >{`${artist} - ${title}`}</Typography>
          </a>
        </Link>
      </Box>
    </Box>
  )
}

export default ProfileCollection
