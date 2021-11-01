import Box from '@material-ui/core/Box'
import {styled} from '@mui/material/styles'

const NinaBox = ({children, columns}) => (
  <StyledBox columns={columns}>
    {children}
  </StyledBox>
)

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "columns"
})(({theme, columns}) => ({
  ...theme.helpers.grid,
  width: '765px',
  height: '547px',
  margin: 'auto',
  gridTemplateColumns: columns ? `repeat(${columns}, 1fr)` : 'repeat(2, 1fr)',
  backgroundColor: theme.palette.white,
  gridColumnGap: '0px',
  border: '2px solid blue',
  gridAutoRows: 'auto'
}))
export default NinaBox;