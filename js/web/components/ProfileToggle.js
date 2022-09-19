import { Box, Tab } from '@mui/material'
import { styled } from '@mui/system'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import { Typography } from '@mui/material'
const ProfileToggle = ({
  onToggleClick,
  isClicked,
  onPlayReleases,
  onPlayCollection,
}) => {
  return (
    <ResponsiveContainer sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', rowGap: 1, pb: 1 }}>
        <ResponsiveTab>
          <a>
            <Typography
              onClickCapture={onToggleClick}
              sx={{ fontWeight: `${isClicked === 0 ? 'bold' : ''}` }}
              id={0}
            >
              Releases
            </Typography>
          </a>

          <PlayCircleOutlineOutlinedIcon
            onClickCapture={onPlayReleases}
            sx={{ pr: 1.5, pl: 0.5 }}
          />
        </ResponsiveTab>
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
              onClickCapture={onToggleClick}
              id={1}
              sx={{ fontWeight: `${isClicked === 1 ? 'bold' : ''}` }}
            >
              Collection
            </Typography>
          </a>

          <PlayCircleOutlineOutlinedIcon
            onClickCapture={onPlayCollection}
            sx={{ pr: 1.5, pl: 0.5 }}
          />
        </Box>
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
            onClickCapture={onToggleClick}
            id={2}
            sx={{ fontWeight: `${isClicked === 2 ? 'bold' : ''}` }}
            >Hubs</Typography>
          </a>
        </Box>
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
