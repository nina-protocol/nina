import { Box } from '@mui/system'
import Link from 'next/link'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Paper from '@mui/material/Paper'

import { useContext } from 'react'
import Image from 'next/image'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import { Button, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
const { getImageFromCDN, loader } = imageManager

const ProfileReleases = ({ profileReleases }) => {
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
            {profileReleases?.length === 0 && (
              <Box>No releases belong to this address</Box>
            )}
            {profileReleases.map((release) => (
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


export default ProfileReleases
