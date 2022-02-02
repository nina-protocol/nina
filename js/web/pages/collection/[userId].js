import UserCollection from '../../components/UserCollection'

const UserCollectionPage = ({ userId }) => {
  return <UserCollection userId={userId} />
}

export default UserCollectionPage

export const getServerSideProps = async (context) => {
  const userId = context.params.userId
  return {
    props: {
      userId: userId,
    },
  }
}
