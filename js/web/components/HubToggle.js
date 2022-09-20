import { useContext } from 'react'

import { Box } from '@mui/material'
import { styled } from '@mui/system'
import { Typography } from '@mui/material'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { useSnackbar } from 'notistack'

const HubToggle = ({ isActive, hubTabs, viewHandler, releaseData }) => {
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
    <ResponsiveContainer
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', rowGap: 1, py: 1 }}>
        {hubTabs?.map((tab, index) => (
          <>
            {tab.visible && (
              <Box
                sx={{
                  cursor: 'pointer',
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'row',
                  textTransform: 'uppercase',
                }}
              >
                <a>
                  <Typography
                    sx={{ fontWeight: `${isActive === index ? 'bold' : ''}` }}
                    id={index}
                    onClickCapture={(e) => viewHandler(e)}
                  >
                    {tab.name}
                  </Typography>
                </a>
                {tab.playlist && (
                  <PlayCircleOutlineOutlinedIcon
                    onClickCapture={() => playAllHandler(releaseData)}
                    sx={{ pr: 1.5, pl: 0.5 }}
                  />
                )}
              </Box>
            )}
          </>
        ))}
      </Box>
    </ResponsiveContainer>
  )
}

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

export default HubToggle
