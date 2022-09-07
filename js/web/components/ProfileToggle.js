import { Box, Tabs, Tab } from '@mui/material'
const ProfileToggle = ({ releaseClick, hubClick, collectionClick, isClicked }) => {
  return (
    <Box sx={{ width:"50vw", borderBottom: 1, borderColor: 'divider', p: 1, m: 1, display:"flex", flexDirection:"row", alignItems:'center', justifyContent:'center'}}>
      <Tabs>
        <Tab onClick={releaseClick} label="Releases" value="Releases"  sx={{color: `${isClicked === 'releases' ? 'black' : ''}`}} />
        <Tab onClick={hubClick} label="Hubs" value="Hubs"  sx={{color: `${isClicked === 'hubs' ? 'black' : ''}`}} />
        <Tab onClick={collectionClick} label="Collection" value="Collection"  sx={{color: `${isClicked === 'collection' ? 'black' : ''}`}} />
      </Tabs>
    </Box>
  )
}

export default ProfileToggle
