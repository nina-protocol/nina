<img src="https://avatars.githubusercontent.com/u/83779826?s=400&u=557293e1b5a915ecb38f643fabe23f20ee4b11d0" alt="drawing" width="200"/>

nina: a self-publishing protocol for musicians - on solana

---

**Note: Nina is in active development - APIs subject to change - code is unaudited - use at your own risk**

---

# Getting Started

## Solana Program
Nina's Solana program is written in [Anchor](https://github.com/coral-xyz/anchor) - first follow their [guide](https://www.anchor-lang.com/docs/installation)

Once Anchor environment is configured you can run tests for the on-chain programs from the root directory:
`anchor test ./tests`

## Frontend
Nina's frontend packages can be found in the `/js` folder.  `/js/nina-common` contains the core components for interaction with the Nina Solana Program.  It will enentually contain shared UI components amongst the various Nina frontend projects (first will be the Nina UI, Embeddable packages, etc)

The Soft LP project can be run from the `/js` folder with the following commands:

```
yarn nina-common install
yarn nina-common build
yarn soft-lp install
yarn soft-lp start
```

`yarn nina-common watch` can be run if you want live changes to be compiled during development
