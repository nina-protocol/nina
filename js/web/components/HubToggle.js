import { Box } from '@mui/material'
import { styled } from '@mui/system'
import { Typography } from '@mui/material'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
const HubToggle = ({ onToggleClick, isClicked, onPlayReleases }) => {
  return (
    <ResponsiveContainer
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', rowGap: 1, py: 1 }}>
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
              sx={{ fontWeight: `${isClicked === 0 ? 'bold' : ''}` }}
              id={0}
              onClickCapture={onToggleClick}
            >
              Releases
            </Typography>
          </a>
          <PlayCircleOutlineOutlinedIcon
            onClickCapture={onPlayReleases}
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
              onClick={onToggleClick}
              id={1}
              sx={{ fontWeight: `${isClicked === 1 ? 'bold' : ''}` }}
            >
              Collaborators
            </Typography>
          </a>
        </Box>
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
