import { useMemo,useEffect, useContext, useState } from "react"
import Release from "@nina-protocol/nina-internal-sdk/esm/Release"
import Hub from "@nina-protocol/nina-internal-sdk/esm/Hub"

const Profile = ({userId}) => {
  
    const {
        getUserCollection,
        releaseState,
        filterReleasesUserCollection,
        filterReleasesPublishedByUser,
        getReleasesAll,
        getReleasesInCollection,
        getReleasesPublishedByUser
    }   = useContext(Release.Context)
    const {
        getHubsForUser,
        filterHubsForUser
    } = useContext(Hub.Context)
    const [profileReleases, setProfileReleases] = useState([])
    const [profileCollection, setProfileCollection] = useState([])
    const [profileHubs, setProfileHubs] = useState([])
    const [view, setView] = useState('')
    // const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])
    const releaseData = useMemo(() => releaseState[userId], [releaseState, userId])
    useEffect( () => {
        //  getUserCollection(userId)
         getReleasesPublishedByUser(userId)
        //  getReleasesInCollection(userId)
        // setProfileReleases([])
        // setProfileCollection([])
        // setProfileHubs([])
    },[userId])


   useEffect(() => {
    console.log('userId', userId)
    const releases = filterReleasesPublishedByUser(userId)
    console.log('releasesxx', releases)
    console.log('releaseState', releaseState)
   },[releaseState])

   useEffect(() => {
    // const hubs = filterHubsForUser(userId)
    // console.log('hubs', hubs)
   },[userId])

   useEffect(() => {
    // const collection = filterReleasesUserCollection(userId)
    // console.log('collection', collection)
}, [userId])

    return (
        <div>
            Welcome {userId}
        </div>
    );
}

export default Profile;