# Nina Hub Starter

## _A Next.js app template for Nina Hubs_

Hubs are Nina's social graph primtive, this application creates a frontend for displaying and interacting with the [Hub SDK](https://github.com/nina-protocol/nina-hub-sdk), a client for the Nina Program running on [Solana](https://github.com/solana-labs/solana).

## Features

- Add / Remove Hub Collaborators
- Curate existing Nina releases on your Hub
- Create Releases through your Hub

## Getting Started

The first thing you will need is a `HUB_PUBLIC_KEY`. To find your `HUB_PUBLIC_KEY`, visit [ninaprotocol.com/hubs](https://ninaprotocol.com/hubs) and connect your Solana wallet.

If you have previously created a Hub, the publicKey will be displayed. If not, please create a hub through the provided interface. Your `HUB_PUBLIC_KEY` will be displayed after it is successfully created.

Set your `HUB_PUBLIC_KEY` in `next.config.js`

```

 env: {
      REACT_APP_CLUSTER: 'devnet',
      REACT_HUB_PUBLIC_KEY: '{Your HUB_PUBLIC_KEY HERE}',
    }

```

Install dependencies and start the server

```sh
yarn install
yarn dev
```

The Hub Starter uses Next.JS's [Pages](https://nextjs.org/docs/basic-features/pages) to control navigation and routes.

The project has the following structure:

```
Nina Hub Starter

│
└───components
│   │   AudioPlayer.js
│   │   Bundlr.js
│   │   Layout.js
│   │   ...
│
└───pages
    │   _app.js
    │   _document.js
    │   dashboard.js
    │   index.js
    │   upload.js
    └───[releasePubkey]
│       │   index.js
└───styles
└───utils

```

- `/pages/index.js` is the Application's entrypoint
- `components/Layout.js` contains high level containers of the app's dom structure. The Hub Starter uses Material UI's [Grid](https://mui.com/components/grid/). The top level grid container can be found here.

** Publish to vercel instructions here **

```sh
yarn install
yarn dev
```

## License

MIT

**Free Software, Hell Yeah!**

[//]: # "These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax"
[dill]: https://github.com/joemccann/dillinger
[git-repo-url]: https://github.com/joemccann/dillinger.git
[john gruber]: http://daringfireball.net
[df1]: http://daringfireball.net/projects/markdown/
[markdown-it]: https://github.com/markdown-it/markdown-it
[ace editor]: http://ace.ajax.org
[node.js]: http://nodejs.org
[twitter bootstrap]: http://twitter.github.com/bootstrap/
[jquery]: http://jquery.com
[@tjholowaychuk]: http://twitter.com/tjholowaychuk
[express]: http://expressjs.com
[angularjs]: http://angularjs.org
[gulp]: http://gulpjs.com
[pldb]: https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md
[plgh]: https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md
[plgd]: https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md
[plod]: https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md
[plme]: https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md
[plga]: https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md
