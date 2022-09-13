import dynamic from 'next/dynamic'
import { Box } from '@mui/material'
const Profile = dynamic(() => import('../../../components/Profile'))
import { styled } from '@mui/system'
const ScrollablePageWrapper = dynamic(() =>
  import('../../../components/ScrollablePageWrapper')
)
const ProfilePage = (props) => {
  const { userId } = props
  return (
    // <ScrollablePageWrapper>
    <ResponsiveProfileContainer>
      <Profile userId={userId} />
    </ResponsiveProfileContainer>
    // </ScrollablePageWrapper>
  )
}

const ResponsiveProfileContainer = styled(Box)(({theme}) => ({
  width: '960px',
  minHeight: '60vh',
  [theme.breakpoints.down('md')]: {
    minHeight:'40vh'
  }
}))

export default ProfilePage

export const getStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          userId: 'placeholder',
        },
      },
    ],
    fallback: 'blocking',
  }
}

export const getStaticProps = async (context) => {
  const userId = context.params.userId
  return {
    props: {
      userId: userId,
    },
  }
}
