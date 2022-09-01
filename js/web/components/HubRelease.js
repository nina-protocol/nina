const HubRelease = ({onPlay, onQueue, artistName, trackName}) => {
    return (
        <div>
            <div onClick={onPlay}>
                play
            </div>
            <div onClick={onQueue}>
                queue
            </div>
            <div>
                {artistName}
            </div>
            <div>
                {trackName}
            </div>
        </div>
    );
}

export default HubRelease;