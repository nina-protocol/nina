import dynamic from 'next/dynamic'

const Profile = dynamic(() => import('../../components/Profile'))

const ProfilePage = (props) => {
    const {userId} = props
    return (
        <div>
           <Profile userId={userId} />
           {/* hello */}
        </div>
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