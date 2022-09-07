import dynamic from 'next/dynamic'
import { Box } from '@material-ui/core'
const Profile = dynamic(() => import('../../../components/Profile'))

const ProfilePage = (props) => {
    const {userId} = props
    return (
        <Box sx={{width:'50vw'}}>
           <Profile userId={userId} />
        </Box>
    );
}

export default ProfilePage;

export const getStaticPaths = async () => {
    return {
      paths: [
        {
          params: {
            userId: 'placeholder',
          }
        }
      ],
      fallback: 'blocking'
    }
  }

export const getStaticProps = async (context) => {
    const userId = context.params.userId
    return {
        props: {
            userId: userId,
        }
    }
}