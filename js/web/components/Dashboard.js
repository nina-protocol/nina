import Profile from "./Profile"

const Dashboard = (props) => {
  const {publicKey} = props
  console.log('publicKey :>> ', publicKey);
  return (
    <>
      <Profile profilePubkey={publicKey} inDashboard={true}/>
    </>
  )
}

export default Dashboard