import { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles';
import { Tabs, TabPanel, TabList, Tab } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'

import { useWallet } from '@solana/wallet-adapter-react'
import ninaCommon from 'nina-common'
import SlpPurchase from './SlpPurchase'
import SlpRedeem from './SlpRedeem'

const PREFIX = 'SlpTabs';

const classes = {
  releaseTabsWrapper: `${PREFIX}-releaseTabsWrapper`,
  releaseTabsContainer: `${PREFIX}-releaseTabsContainer`,
  releaseTabsList: `${PREFIX}-releaseTabsList`
};

const Root = styled('div')((
  {
    theme
  }
) => ({
  [`&.${classes.releaseTabsWrapper}`]: {
    borderRadius: `${theme.palette.borderRadius}`,
    height: '100%',
  },

  [`& .${classes.releaseTabsContainer}`]: {
    height: '100%',
    [theme.breakpoints.down('md')]: {
      padding: '0rem',
    },
  },

  [`& .${classes.releaseTabsList}`]: {
    display: 'none',
  }
}));

const { Exchange, ReleaseSettings } = ninaCommon.components
const { ExchangeContext, NinaContext, ReleaseContext } = ninaCommon.contexts

const SlpTabs = (props) => {
  const { releasePubkey, activeIndex } = props

  const wallet = useWallet()
  const {
    releaseState,
    getRedemptionRecordsForRelease,
    redeemableState,
    getRedeemablesForRelease,
  } = useContext(ReleaseContext)
  const { getAmountHeld, collection } = useContext(NinaContext)
  const { exchangeState } = useContext(ExchangeContext)
  const [redeemable, setRedeemable] = useState()
  const [redemptionRecords, setRedemptionRecords] = useState()
  const [amountHeld, setAmountHeld] = useState(0)
  const [userIsPublisher, setUserIsPublisher] = useState(false)
  const [userRedemptionRecords, setUserRedemptionRecords] = useState()
  const metadata = releaseState.metadata[releasePubkey]

  useEffect(() => {
    getRedeemablesForRelease(releasePubkey)
  }, [])

  useEffect(() => {
    setUserIsPublisher(
      wallet?.publicKey?.toBase58() ===
        releaseState.tokenData[releasePubkey]?.authority.toBase58()
    )
  }, [wallet?.connected])

  useEffect(() => {
    setRedeemable(redeemableState[releasePubkey])
  }, [redeemableState[releasePubkey]])

  useEffect(() => {
    if (wallet?.connected) {
      getRedemptionRecordsForRelease(releasePubkey)
    }
  }, [redeemableState[releasePubkey], wallet?.connected])

  useEffect(() => {
    if (
      redeemableState[releasePubkey] &&
      releaseState.redemptionRecords[releasePubkey]
    ) {
      setRedemptionRecords(releaseState.redemptionRecords[releasePubkey])
    }
  }, [
    releaseState.redemptionRecords[releasePubkey],
    redeemableState[releasePubkey],
  ])

  useEffect(() => {
    if (wallet.connected && redemptionRecords) {
      setUserRedemptionRecords(redemptionRecords)
    }
  }, [wallet?.connected, redemptionRecords])

  useEffect(() => {
    if (releaseState.metadata[releasePubkey] && wallet?.publicKey) {
      getAmountHeld(releaseState.releaseMintMap[releasePubkey], releasePubkey)
    }
  }, [wallet?.connected, releaseState?.metadata[releasePubkey]])

  useEffect(() => {
    setAmountHeld(collection[releasePubkey] || 0)
  }, [collection[releasePubkey]])

  return (
    <Root className={classes.releaseTabsWrapper}>
      <div className={classes.releaseTabsContainer}>
        <Tabs
          releasePubkey={releasePubkey}
          className={classes.releaseTabs}
          selectedIndex={activeIndex}
          onSelect={() => true}
        >
          <TabList className={classes.releaseTabsList}>
            <Tab>Buy</Tab>
            <Tab>Market</Tab>
            <Tab>Redeem</Tab>
            {wallet?.connected && userIsPublisher && <Tab>user</Tab>}
          </TabList>

          <TabPanel style={{ height: '93%' }}>
            {releasePubkey && (
              <SlpPurchase releasePubkey={releasePubkey} metadata={metadata} />
            )}
          </TabPanel>

          <TabPanel style={{ height: '93%' }}>
            <Exchange
              releasePubkey={releasePubkey}
              exchanges={exchangeState.exchanges}
              metadata={metadata}
            />
          </TabPanel>

          <TabPanel>
            {releasePubkey && (
              <SlpRedeem
                releasePubkey={releasePubkey}
                metadata={metadata}
                amountHeld={amountHeld}
                userRedemptionRecords={userRedemptionRecords}
                redeemables={redeemable}
              />
            )}
          </TabPanel>

          {wallet?.connected && userIsPublisher && (
            <TabPanel style={{ height: '100%' }}>
              <ReleaseSettings
                releasePubkey={releasePubkey}
                inCreateFlow={false}
                redemptionRecords={redemptionRecords}
              />
            </TabPanel>
          )}
        </Tabs>
      </div>
    </Root>
  );
}

export default SlpTabs
