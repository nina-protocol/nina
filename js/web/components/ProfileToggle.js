import { Box, Tabs, Tab } from '@mui/material'
import { styled } from '@mui/system'

const ProfileToggle = ({ releaseClick, hubClick, collectionClick, isClicked }) => {
  return (
    <ResponsiveContainer sx={{ borderBottom: 1, borderColor: 'divider'}}>
      <Tabs>
        <StyledTab disableRipple onClick={releaseClick} label="Releases" value="Releases"  sx={{color: `${isClicked === 'releases' ? 'black' : ''}`}} />
        <StyledTab disableRipple onClick={hubClick} label="Hubs" value="Hubs"  sx={{color: `${isClicked === 'hubs' ? 'black' : ''}`}} />
        <StyledTab disableRipple onClick={collectionClick} label="Collection" value="Collection"  sx={{color: `${isClicked === 'collection' ? 'black' : ''}`}} />
      </Tabs>
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

const StyledTab = styled(Tab)(({theme}) => ({
  p:0,
}))

export default ProfileToggle
