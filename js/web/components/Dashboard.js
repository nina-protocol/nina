import Profile from "./Profile"

const Dashboard = (props) => {
  const {publicKey} = props
  return (
    <Profile profilePubkey={publicKey} inDashboard={true} />
  )
}

export default Dashboard