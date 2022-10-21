import dynamic from "next/dynamic";
import NinaSdk from '@nina-protocol/js-sdk'
import {styled} from '@mui/material'
import {Box} from '@mui/material'

const Search = dynamic(() => import('../../components/Search'))

const SearchPage = (props) => {
  const {searchQuery, searchResults} = props

    return (
      <ResponsiveSearchContainer>

        <Search searchQuery={searchQuery} searchResults={searchResults}/>
      </ResponsiveSearchContainer>
    )
}

const ResponsiveSearchContainer = styled(Box)(({theme}) => ({
  width: theme.maxWidth,
 
  [theme.breakpoints.down('md')]: {
    minHeight:'40vh',
    padding: '0',
  }
}))

  
  export const getServerSideProps = async ({query}) => {
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
      props:{}
    }
  }

export default SearchPage;