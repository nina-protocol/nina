import UserCollection from '../../components/UserCollection'
import Head from 'next/head'

const UserCollectionPage = ({ userId }) => {
  const nameString = `${userId.slice(0, 4) + '..' + userId.slice(-4)}'s`

  return (
    <>
      <Head>
        <title>{`Nina Protocol - ${nameString} Collection`}</title>
        <meta
          name="description"
          content={'Nina Protocol is a digitally native music ecosystem'}
        />
        <meta name="og:type" content="website" />
        <meta name="og:title" content="Nina Protocol" />
        <meta
          name="og:description"
          content={'Nina Protocol is a digitally native music ecosystem'}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/png" />
        <meta name="twitter:title" content="Nina Protocol" />
        <meta
          name="twitter:description"
          content={'Nina Protocol is a digitally native music ecosystem'}
        />

        <meta
          name="twitter:image"
          content="https://ninaprotocol.com/images/nina-blue.png"
        />
        <meta
          name="og:image"
          href="https://ninaprotocol.com/images/nina-blue.png"
        />
      </Head>
      <UserCollection userId={userId} />
    </>
  )
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
