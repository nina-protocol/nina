import dynamic from 'next/dynamic'
const Profile = dynamic(() => import('./Profile'))
const Dashboard = (props) => {
  const { publicKey } = props
  return <Profile profilePubkey={publicKey} />
}

export default Dashboard
