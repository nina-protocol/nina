import { useContext } from 'react'
import { Box, Tab } from '@mui/material'
import { styled } from '@mui/system'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import { Typography } from '@mui/material'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { useSnackbar } from 'notistack'
import {Button} from '@mui/material'
const TabHeader = ({
  isActive,
  profileTabs,
  viewHandler,
  type,
  releaseData,
}) => {
  const { resetQueueWithPlaylist } = useContext(Audio.Context)
  const { enqueueSnackbar } = useSnackbar()

  const playAllHandler = (playlist) => {
    resetQueueWithPlaylist(
      playlist?.map((release) => release.publicKey)
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
                }}
              >
                <ResponsiveTab>
                  <Typography
                
                    onClickCapture={viewHandler}
                    sx={{
                      fontWeight: `${isActive === index ? 'bold' : ''}`,
                      '&:hover': {
                        opacity: 0.5,
                      },
                    }}
                    id={index}
                  >
                    {tab.name}
                  </Typography>

                  {tab.playlist && (
                    <ResponsiveCircleOutlineIconContainer
                 
                      sx={{
                        paddingRight: 1.5,
                         paddingTop: '1px',
                        '&:hover': {
                          opacity: 0.5,
                        },
                      }}
                    >
                      <PlayCircleOutlineIconButtonWrapper 
                 
                      onClickCapture={() =>
                          type === 'hubsView'
                            ? playAllHandler(releaseData)
                            : playAllHandler(tab.playlist)
                        }
                        >
                      <PlayCircleOutlineOutlinedIcon
                      />

                      </PlayCircleOutlineIconButtonWrapper>
                    </ResponsiveCircleOutlineIconContainer>
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
  minWidth: '100px',
  paddingRight: '15px',
  [theme.breakpoints.down('md')]: {
    paddingLeft: '15px',
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

const PlayCircleOutlineIconButtonWrapper = styled(Button)(({ theme }) => ({
  m:0,
  color: 'black',
  px: 1,
   [theme.breakpoints.down('md')]: {
    paddingRight: 0.5,
  },
}))

const ResponsiveCircleOutlineIconContainer = styled(Box)(({ theme }) => ({
    paddingRight: 1.5,
     paddingTop: '1px',
    '&:hover': {
      opacity: 0.5,
    },
    [theme.breakpoints.down('md')]: {
      paddingRight: '15px',
    },
}))

export default TabHeader
