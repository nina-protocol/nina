import Hub from '../../../components/Hub'

const HubPage = ({ hubPubkey }) => {
  return (
    <>
      <Hub hubPubkey={hubPubkey} />
    </>
  )
}

export const getServerSideProps = async (context) => {
  const hubPubkey = context.params.hubPubkey
  return {
    props: {
      hubPubkey,
    },
  }
}

export default HubPage
