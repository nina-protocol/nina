import Box from '@material-ui/core/Box'
import {styled} from '@mui/material/styles'

const NinaBox = ({children, columns, justifyItems, gridColumnGap}) => (
  <StyledBox columns={columns} justifyItems={justifyItems} gridColumnGap={gridColumnGap}>
    {children}
  </StyledBox>
)

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop,
})(({theme, columns, justifyItems, gridColumnGap}) => ({
  ...theme.helpers.grid,
  justifyItems: justifyItems ? justifyItems : 'center',
  width: '765px',
  height: '547px',
  margin: 'auto',
  gridTemplateColumns: columns ? columns : 'repeat(2, 1fr)',
  backgroundColor: theme.palette.white,
  gridColumnGap: gridColumnGap ? gridColumnGap : '0px',
  // border: '2px solid blue',
  gridAutoRows: 'auto'
}))
export default NinaBox;