import axios from "axios"
import dynamic from "next/dynamic"
const Hub = dynamic(() => import('../../../components/Hub'))
const HubPage = (props) => {
  console.log('props', props)
  return <div>
    <Hub hubPubkey={props.hubPubkey}/>
   </div>
}



export default HubPage

export const getStaticPaths = async () => {
    return {
      paths: [
        {
          params: {
            hubPubkey: 'placeholder',
          }
        }
      ],
      fallback: 'blocking'
    }
  }
  
  export const getStaticProps = async (context) => {
    const indexerUrl = process.env.INDEXER_URL;
    const hubPubkey = context.params.hubPubkey;
    const indexerPath = indexerUrl + `/hubs/${hubPubkey}`;
    
    let hub;
    if (hubPubkey && hubPubkey !== 'manifest.json') {
      try {
        const result = await axios.get(indexerPath);
        const data = result.data;
        hub = data.hub;
        console.log('dataxx', data)
        return {
          props: {
            hub,
            hubPubkey: hub.id,
          },
          revalidate: 10
        };
      } catch (error) {
        console.warn(error);
      }
    }
    return {props:{}};
  };
