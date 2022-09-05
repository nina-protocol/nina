import { Box, Tabs, Tab } from '@mui/material'
const ProfileToggle = ({ releaseClick, hubClick, collectionClick }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 1, m: 1 }}>
      <Tabs>
        <Tab onClick={releaseClick} label="Releases" value="Releases" />
        <Tab onClick={hubClick} label="Hubs" value="Hubs" />
        <Tab onClick={collectionClick} label="Collection" value="Collection" />
      </Tabs>
    </Box>
  )
}

export default ProfileToggle
