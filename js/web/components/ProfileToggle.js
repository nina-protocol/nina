import { useContext } from 'react'
import { Box, Tab } from '@mui/material'
import { styled } from '@mui/system'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import { Typography } from '@mui/material'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { useSnackbar } from 'notistack'

const ProfileToggle = ({ isActive, profileTabs, viewHandler }) => {
  const { resetQueueWithPlaylist } = useContext(Audio.Context)
  const { enqueueSnackbar } = useSnackbar()

  const playAllHandler = (playlist) => {
    resetQueueWithPlaylist(
      playlist.map((release) => release.releasePubkey)
    ).then(() =>
      enqueueSnackbar(`Releases added to queue`, {
        variant: 'info',
      })
    )
  }

  return (
    <ResponsiveContainer sx={{ 
      borderBottom: 1, borderColor: 'divider'
      

      }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', rowGap: 1, pb: 1 }}>
        {profileTabs?.map((tab, index) => (
          <>
            {tab.visible === true && (
              <Box
                key={index}
                sx={{
                  cursor: 'pointer',
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'row',
                  textTransform: 'uppercase',
                  width: '150px',
                }}
              >
                <ResponsiveTab key={index}>
                  <a key={index}>
                    <Typography
                      key={index}
                      onClickCapture={viewHandler}
                      sx={{ fontWeight: `${isActive === index ? 'bold' : ''}` }}
                      id={index}
                    >
                      {tab.name}
                    </Typography>
                  </a>
                  {tab.playlist && (
                    <PlayCircleOutlineOutlinedIcon
                      onClickCapture={() => playAllHandler(tab.playlist)}
                      sx={{ pr: 1.5, pl: 0.5 }}
                    />
                  )}
                </ResponsiveTab>
              </Box>
            )}
          </>
        ))}
      </Box>
    </ResponsiveContainer>
  )
}

const ResponsiveTab = styled(Box)(({ theme }) => ({
  cursor: 'pointer',
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  textTransform: 'uppercase',
  [theme.breakpoints.down('md')]: {
    paddingLeft: '10px',
  },
}))

const ResponsiveContainer = styled(Box)(({ theme }) => ({
  minWidth: '50vw',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'start',

  [theme.breakpoints.down('md')]: {
    width: '100vw',
  },
}))

export default ProfileToggle
