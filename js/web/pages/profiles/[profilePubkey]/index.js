import dynamic from 'next/dynamic'
import { Box } from '@mui/material'
import { styled } from '@mui/system'
const Profile = dynamic(() => import('../../../components/Profile'))

const ProfilePage = (props) => {
  const { profilePubkey } = props
  return (
   
    <ResponsiveProfileContainer>
      <Profile profilePubkey={profilePubkey} />
    </ResponsiveProfileContainer>

  )
}

const ResponsiveProfileContainer = styled(Box)(({theme}) => ({
  width: theme.maxWidth,
  minHeight: '60vh',
  maxHeight:'100vh',
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
          profilePubkey: 'placeholder',
        },
      },
    ],
    fallback: 'blocking',
  }
}

export const getStaticProps = async (context) => {
  const profilePubkey = context.params.profilePubkey
  return {
    props: {
      profilePubkey: profilePubkey,
    },
  }
}
