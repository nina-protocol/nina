import Dashboard from '../../components/Dashboard'
import axios from 'axios'

const DashboardPage = ({hubPubkey}) => {
  return (
    <>
      <Dashboard hubPubkey={hubPubkey} />
    </>
  )
}

DashboardPage.getInitialProps = async (context) => {
  const indexerUrl = process.env.INDEXER_URL
  const hubPubkey= context.query.hubPubkey

  const indexerPath = indexerUrl + `/hubs/${hubPubkey}`
  let hub;

  try {
    const result = await axios.get(indexerPath)
    hub = result.data.hub
    return {
      hub,
      hubPubkey: hub.id
    }
  } catch (error) {
    console.warn(error)
    return {}
  }
}
export default DashboardPage
