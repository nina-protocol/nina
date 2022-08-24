import React, { useContext, useState, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import RedeemableInitialize from './RedeemableInitialize.js'
import Royalty from './Royalty.js'

const ReleaseInfo = (props) => {
  const {
    releasePubkey,
    metadata,
    artistAddress,
    userIsPublisher,
    redeemables,
  } = props

  const { releaseState } = useContext(Release.Context)
  const [release, setRelease] = useState(releaseState.tokenData[releasePubkey])

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey])
    }
  }, [releaseState.tokenData[releasePubkey]])

  if (!metadata || metadata.length === 0) {
    return <></>
  }
  const minutes = Math.floor(
    metadata.properties.files[0].duration / 60
  ).toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })

  const seconds = Math.ceil(
    metadata.properties.files[0].duration - minutes * 60
  ).toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })

  return (
    <StyledBox className={classes.root}>
      <Box mt={6}>
        <Typography variant="body2" component="p" gutterBottom>
          <strong>Running Time:</strong> {`${minutes}:${seconds}`}
        </Typography>
        <Typography variant="body2" component="p" gutterBottom>
          <strong>Released:</strong>{' '}
          {metadata.properties.date ? metadata.properties.date : 'pending'}
        </Typography>

        {artistAddress && (
          <Typography variant="body2" component="p" gutterBottom>
            <strong>Pressed By:</strong>{' '}
            <a
              className="link"
              href={`https://explorer.solana.com/address/${artistAddress}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
            >
              ...{artistAddress.slice(-6)}
            </a>
          </Typography>
        )}
        <Typography
          variant="body2"
          component="p"
          className={`${classes.releaseInfoDescription}`}
        >
          {metadata.description}
        </Typography>
      </Box>

      <Box>
        {userIsPublisher && !redeemables && (
          <Box mt={3}>
            <RedeemableInitialize
              releasePubkey={releasePubkey}
              amount={releaseState.tokenData[
                releasePubkey
              ]?.totalSupply.toNumber()}
            />
          </Box>
        )}

        {redeemables && (
          <>
            <Box mt={3}>
              <Typography variant="h6" align="left" gutterBottom>
                Redeemables:
              </Typography>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {redeemables?.description}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {redeemables.redeemedCount.toNumber()} /{' '}
                    {redeemables.redeemedMax.toNumber()} redeemed
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </>
        )}

        <Royalty releasePubkey={releasePubkey} release={release} />
      </Box>
    </StyledBox>
  )
}

const PREFIX = 'ReleaseInfo'

const classes = {
  root: `${PREFIX}-root`,
  releaseInfoDescription: `${PREFIX}-releaseInfoDescription`,
}

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  [`& .${classes.releaseInfoDescription}`]: {
    border: `${theme.palette.borderWidth} solid ${theme.palette.purpleLight}`,
    maxHeight: '40vh',
    overflow: 'scroll',
    padding: '1rem',
    boxShadow: '1px 4px 12px 3px rgba(150, 152, 204,0.43)',
  },
}))

export default ReleaseInfo
