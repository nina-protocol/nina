import dynamic from 'next/dynamic'
import NinaSdk from '@nina-protocol/js-sdk'
import { styled } from '@mui/material'
import { Box } from '@mui/material'
import Head from 'next/head'
const Search = dynamic(() => import('../../components/Search'))

const SearchPage = (props) => {
  const { searchQuery, searchResults } = props
  console.log('searchQuery', searchQuery)
  return (
    <>
      <Head>
        <title>{`Nina: ${
          searchQuery ? `Search Results For ${searchQuery.q}` : `Search`
        }`}</title>
        <meta
          name="description"
          content={`${
            searchQuery
              ? `Search Results For ${searchQuery?.q} on Nina.`
              : `Search on Nina`
          }`}
        />
        <meta name="og:type" content="website" />
        <meta
          name="og:title"
          content={`Nina: ${
            searchQuery ? `Search Results For ${searchQuery.q}` : `Search`
          }`}
        />
        <meta
          name="og:description"
          content={`${
            searchQuery
              ? `Search Results For ${searchQuery?.q} on Nina.`
              : `Search on Nina`
          }`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ninaprotocol" />
        <meta name="twitter:creator" content="@ninaprotocol" />
        <meta name="twitter:image:type" content="image/jpg" />
        <meta
          name="twitter:title"
          content={`${
            searchQuery
              ? `Search Results For ${searchQuery?.q} on Nina.`
              : `Search on Nina`
          }`}
        />
        <meta
          name="twitter:description"
          content={`${
            searchQuery
              ? `All search results belonging to ${searchQuery?.q} on Nina.`
              : `Search for music on Nina`
          }`}
        />
        <meta name="twitter:image" content="/images/favicon.ico" />
        <meta name="og:image" content={'/images/favicon.ico'} />
        <meta property="og:title" content="iPhone" />
        <meta property="og:image" content={`/images/favicon.ico`} />
      </Head>

      <ResponsiveSearchContainer>
        <Search searchQuery={searchQuery} searchResults={searchResults} />
      </ResponsiveSearchContainer>
    </>
  )
}

const ResponsiveSearchContainer = styled(Box)(({ theme }) => ({
  width: theme.maxWidth,

  [theme.breakpoints.down('md')]: {
    minHeight: '40vh',
    padding: '0',
  },
}))

export const getServerSideProps = async ({ query }) => {
  const searchQuery = query.q

  if (searchQuery) {
    try {
      if (!NinaSdk.client.provider) {
        NinaSdk.client.init(
          process.env.NINA_API_ENDPOINT,
          process.env.SOLANA_CLUSTER_URL,
          process.env.NINA_PROGRAM_ID
        )
      }

      const searchResults = await NinaSdk.Search.withQuery(searchQuery)

      return {
        props: {
          searchQuery: query,
          searchResults: searchResults,
        },
      }
    } catch (error) {
      console.warn(error)
    }
  }
  return {
    props: {},
  }
}

export default SearchPage
