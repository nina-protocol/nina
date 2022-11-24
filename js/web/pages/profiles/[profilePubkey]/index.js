import dynamic from 'next/dynamic'
import { Box } from '@mui/material'
import { styled } from '@mui/system'
import Head from 'next/head'
import NinaSdk from '@nina-protocol/js-sdk'
import { initSdkIfNeeded } from '@nina-protocol/nina-internal-sdk/src/utils/sdkInit'
import Dots from '../../../components/Dots'
const Profile = dynamic(() => import('../../../components/Profile'))

const ProfilePage = (props) => {
  const { profilePubkey, loading } = props

  return (
    <>
      <Head>
        <title>{`Nina: ${profilePubkey}'s Profile`}</title>
        <meta name="description" content={`All releases, Hubs, and collection belonging to ${profilePubkey}`} />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`Nina: ${profilePubkey ? `${profilePubkey}'s Profile` : ''}`}
        />
        <meta
          name="og:description"
          content={`All releases, Hubs, and collection belonging to ${profilePubkey}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta name="twitter:title" content={`${profilePubkey} on Nina`} />
        <meta
          name="twitter:description"
          content={`All releases, Hubs, and collection belonging to ${profilePubkey}`}
        />
        <meta name="twitter:image" content="/images/favicon.ico" />
        <meta name="og:image" content={'/images/favicon.ico'} />
        <meta property="og:title" content="iPhone" />
        <meta property="og:image" content={`/images/favicon.ico`} />
      </Head>
      {loading ? (
        <Dots size="80px" />
      ) : (
        <ProfilePageContainer>
          <Profile profilePubkey={profilePubkey} />
        </ProfilePageContainer>
      )}
    </>
  )
}

const ProfilePageContainer = styled(Box)(({ theme }) => ({
  width: theme.maxWidth,

  [theme.breakpoints.down('md')]: {
    minHeight: '40vh',
  },
}))

export default ProfilePage

export const getStaticPaths = async () => {
  await initSdkIfNeeded(true)
  const paths = []
  const { accounts } = await NinaSdk.Account.fetchAll({ limit: 5000 })
  accounts.forEach((account) => {
    paths.push({
      params: {
        profilePubkey: account.publicKey,
      },
    })
  })

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps = async (context) => {
  const profilePubkey = context.params.profilePubkey
  return {
    props: {
      profilePubkey: profilePubkey,
    },
    revalidate: 1000,
  }
}
