import Profile from "./Profile"

const Dashboard = (props) => {
  const {publicKey} = props
  return (
<<<<<<< HEAD
    <Profile profilePubkey={publicKey} inDashboard={true} />
=======
    <>
      <Profile profilePubkey={publicKey} />
    </>
>>>>>>> 482400cca034f8d2e2fe3514a71fa659750bf3c1
  )
}

export default Dashboard