import ninaCommon from "nina-common";
const { NinaClient } = ninaCommon.utils;

const ReleaseEmbedPage = ({ host, metadata }) => {
  const player = `
    <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        <style>
        body {
          margin: 0px;
        }
          .container {
            height: 400px;
            width: 100%;
            position: relative;
          }
          
          .vertical-center {
            margin: 0;
            position: absolute;
            top: 50%;
            left: 50%;
            -ms-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="vertical-center">
            <input id="player-button" type="image" src="https://${host}/play.svg" width="80px height="80px/>
          </div>
          <img id="image" src=${metadata.image} height="100%" width="100%"/>
          <audio id="nina-player" style={{ width: "100%" }} autoplay>
            <source src=${metadata.animation_url} type="audio/mp3" />
          </audio>
        </div>
      </body>
      <script>
        $(document).ready(function () {
            // Bind the DIV element to the .click() method.
            $("#player-button").click(function () {
              let player = $('#nina-player')[0];
              player[player.paused ? 'play' : 'pause']();
            });
            $('#nina-player').on("play", function() {
              let playerButton = $('#player-button')[0];
              playerButton.src = "https://${host}/pause.svg"
            })
            $('#nina-player').on("pause", function() {
              let playerButton = $('#player-button')[0];
              playerButton.src = "https://${host}/play.svg"
            })
        });
      </script>
    </html>
  `;
  var dataURI = "data:text/html," + encodeURIComponent(player);
  return (
    <iframe
      id="nina-player"
      width="100%"
      height="400px"
      style={{ border: "none" }}
      src={dataURI}
    />
  );
};

export const getServerSideProps = async (context) => {
  const releasePubkey = context.params.releasePubkey;
  const metadataResult = await fetch(
    `${NinaClient.endpoints.api}/metadata/bulk`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [releasePubkey] }),
    }
  );
  const metadataJson = await metadataResult.json();
  return {
    props: {
      metadata: metadataJson[releasePubkey],
      releasePubkey,
      isEmbed: true,
      host: context.req.headers.host
    }
  }
}

export default ReleaseEmbedPage;
