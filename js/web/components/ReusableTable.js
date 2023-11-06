import { useState, useEffect, useContext, createElement, Fragment } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Box } from '@mui/system'
import { Button, TableSortLabel, Typography } from '@mui/material'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import DownloadIcon from '@mui/icons-material/Download'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeExternalLinks from 'rehype-external-links'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Wallet from '@nina-protocol/nina-internal-sdk/esm/Wallet'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import { styled } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/router'
import { orderBy } from 'lodash'
import dynamic from 'next/dynamic'
import { downloadManager } from '@nina-protocol/nina-internal-sdk/src/utils'
const { downloadAs } = downloadManager
import { logEvent } from '@nina-protocol/nina-internal-sdk/src/utils/event'
import openInNewTab from '@nina-protocol/nina-internal-sdk/src/utils/openInNewTab'
import Dots from '@nina-protocol/nina-internal-sdk/esm/Dots'
const { getImageFromCDN, loader } = imageManager

const Subscribe = dynamic(() => import('./Subscribe'))

const descendingComparator = (a, b, orderBy) => {
  switch (orderBy) {
    case 'artist':
    case 'title':
      a = a[orderBy]?.toLowerCase()
      b = b[orderBy]?.toLowerCase()
      break

    case 'dateAdded':
      if (new Date(b.dateAdded) < new Date(a.dateAdded)) {
        return -1
      }
      if (new Date(b.dateAdded) > new Date(a.dateAdded)) {
        return 1
      }

      break

    case 'releaseDate':
      if (new Date(b.releaseDate) < new Date(a.releaseDate)) {
        return -1
      }
      if (new Date(b.releaseDate) > new Date(a.releaseDate)) {
        return 1
      }

      break
    default:
      a = parseFloat(a[orderBy]?.replace(/[^\d.-]/g, ''))
      b = parseFloat(b[orderBy]?.replace(/[^\d.-]/g, ''))
      break
  }

  if (b < a) {
    return -1
  }
  if (b > a) {
    return 1
  }
  return 0
}

const ReusableTableHead = (props) => {
  const { tableType, inDashboard, onRequestSort, order } = props
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property)
  }
  let headCells = []

  if (tableType === 'profilePublishedReleases') {
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'title', label: 'Release' })
    headCells.push({ id: 'releaseDate', label: 'Released' })
    if (inDashboard) {
      headCells.push({ id: 'price', label: 'Price' })
      headCells.push({ id: 'remaining', label: 'Remaining' })
      headCells.push({ id: 'collected', label: 'Earnings' })
      headCells.push({ id: 'collect', label: 'Collect' })
    }
    headCells.push({ id: 'ctas', label: '' })
  }

  if (tableType === 'profileCollectionReleases') {
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'title', label: 'Release' })
    headCells.push({ id: 'dateAdded', label: 'Added' })
    headCells.push({ id: 'ctas', label: '' })
  }

  if (tableType === 'profileHubs') {
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'hubName', label: 'Name' })
    headCells.push({ id: 'description', label: 'Description' })
    if (inDashboard) {
      headCells.push({ id: 'hubLink', label: '' })
      headCells.push({ id: 'hubDashboard', label: '' })
    }
  }

  if (tableType === 'hubReleases') {
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'title', label: 'Release' })
    headCells.push({ id: 'releaseDate', label: 'Release Date' })
    headCells.push({ id: 'ctas', label: '' })
  }

  if (tableType === 'allSearchResults') {
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'name', label: '' })
  }
  if (tableType === 'searchResultAccounts') {
    headCells.push({ id: 'image', label: 'Accounts' })
    headCells.push({ id: 'searchResultAccount', label: '' })
  }

  if (tableType === 'searchResultReleases') {
    headCells.push({ id: 'ctas', label: 'Releases' })
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'name', label: '' })
  }

  if (tableType === 'searchResultHubs') {
    headCells.push({ id: 'image', label: 'Hubs' })
  }

  if (tableType === 'filteredSearchResultReleases') {
    headCells.push({ id: 'ctas', label: '' })
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'searchResultRelease', label: '' })
  }
  if (tableType === 'filteredSearchResultHubs') {
    headCells.push({ id: 'image', label: '' })
    headCells.push({ id: 'searchResultHub', label: '' })
  }

  if (tableType === 'filteredSearchResultAccounts') {
    headCells.push({ id: 'image', label: '' }),
      headCells.push({ id: 'searchResultAccount', label: '' })
  }

  return (
    <TableHead>
      <TableRow>
        {headCells?.map((headCell, i) => {
          {
            if (
              headCell.id === 'artist' ||
              headCell.id === 'releaseDate' ||
              headCell.id === 'title' ||
              headCell.id === 'dateAdded' ||
              headCell.id === 'hubName'
            ) {
              return (
                <StyledTableHeadCell
                  key={headCell.id}
                  sx={{ cursor: 'default' }}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={order}
                    onClick={createSortHandler(headCell.id)}
                    disabled={
                      headCell.id === 'ctas' ||
                      headCell.id === 'hubLink' ||
                      headCell.id === 'hubDashboard'
                    }
                    sx={{ '& svg': { fontSize: '14px' } }}
                  >
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {headCell.label}
                    </Typography>
                  </TableSortLabel>
                </StyledTableHeadCell>
              )
            } else {
              return (
                <StyledTableHeadCell
                  key={headCell.id}
                  sx={{ cursor: 'default' }}
                >
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {headCell.label}
                  </Typography>
                </StyledTableHeadCell>
              )
            }
          }
        })}
      </TableRow>
    </TableHead>
  )
}
const HubDescription = ({ description }) => {
  const [hubDescription, setHubDescription] = useState()
  useEffect(() => {
    if (description?.includes('<p>')) {
      unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeSanitize)
        .use(rehypeReact, {
          createElement,
          Fragment,
        })
        .use(rehypeExternalLinks, {
          target: false,
          rel: ['nofollow', 'noreferrer'],
        })
        .process(JSON.parse(description).replaceAll('<p><br></p>', '<br>'))
        .then((file) => {
          setHubDescription(file.result)
        })
    } else {
      setHubDescription(description)
    }
  }, [description])
  return (
    <StyledTableCell align="left">
      <StyledTableDescriptionContainer>
        <Typography noWrap>{hubDescription}</Typography>
      </StyledTableDescriptionContainer>
    </StyledTableCell>
  )
}

const ReusableTableBody = (props) => {
  const {
    items,
    tableType,
    inDashboard,
    collectRoyaltyForRelease,
    refreshProfile,
    dashboardPublicKey,
    order,
    orderBy,
    inCollection,
    walletAddress,
    walletConnected,
  } = props
  const router = useRouter()
  const {
    updateTrack,
    addTrackToQueue,
    isPlaying,
    setIsPlaying,
    track,
    playlist,
    setInitialized,
    audioPlayerRef,
  } = useContext(Audio.Context)
  const { ninaClient, displayNameForAccount, displayImageForAccount } =
    useContext(Nina.Context)

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const [downloadId, setDownloadId] = useState(false)
  const [collectId, setCollectId] = useState(false)
  const snackbarHandler = (message) => {
    const snackbarMessage = enqueueSnackbar(message, {
      persistent: 'true',
      variant: 'info',
    })
    setTimeout(() => closeSnackbar(snackbarMessage), 3000)
  }

  const handlePlay = (e, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    if (isPlaying && track.releasePubkey === releasePubkey) {
      setIsPlaying(false)
    } else {
      if (!audioPlayerRef.current.src) {
        audioPlayerRef.current.load()
      }
      setInitialized(true)
      updateTrack(releasePubkey, true, true)
    }
  }

  const handleQueue = (e, releasePubkey, title) => {
    e.stopPropagation()
    e.preventDefault()
    const isAlreadyQueued = playlist.some((entry) => entry.title === title)
    const filteredTrackName =
      title?.length > 12 ? `${title.substring(0, 12)}...` : title
    if (releasePubkey && !isAlreadyQueued) {
      addTrackToQueue(releasePubkey)
      snackbarHandler(`${filteredTrackName} successfully added to queue`)
    } else {
      snackbarHandler(`${filteredTrackName} already added to queue`)
    }
  }

  const handleCollect = async (e, recipient, releasePubkey) => {
    setCollectId(releasePubkey)
    e.stopPropagation()
    e.preventDefault()
    const result = await collectRoyaltyForRelease(recipient, releasePubkey)
    if (result.success) {
      enqueueSnackbar(result.msg, {
        variant: 'success',
      })
      refreshProfile()
      setCollectId(undefined)
    } else {
      enqueueSnackbar('Error Collecting Revenue for Release', {
        variant: 'error',
      })
      setCollectId(undefined)
    }
  }

  const getComparator = (order, orderBy, type) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy)
  }

  let rows = items?.map((data) => {
    const { releasePubkey } = data
    const playData = {
      releasePubkey,
    }
    let formattedData = {}
    if (
      tableType === 'profilePublishedReleases' ||
      tableType === 'profileCollectionReleases'
    ) {
      formattedData = {
        id: releasePubkey,
        uri: data?.metadata.properties.files[0].uri,
        fileName: data?.metadata.name,
        link: `/${releasePubkey}`,
        image: data?.metadata?.image,
        date: data?.metadata?.properties?.date,
        title: `${data?.metadata?.properties?.artist} - ${data?.metadata?.properties?.title}`,
        artist: data?.metadata?.properties?.artist,
        releaseName: data?.metadata?.properties?.title,
        description: data?.metadata?.description,
        external_url: data?.metadata?.external_url,
      }
      if (tableType === 'profileCollectionReleases') {
        formattedData.dateAdded = new Date(
          data.metadata?.collectedDate
        ).toLocaleDateString()
        if (inDashboard) {
          formattedData.ctas = playData
        }
      } else {
        formattedData.releaseDate = new Date(
          data.metadata?.properties?.date
        ).toLocaleDateString()
        if (!inDashboard) {
          formattedData.ctas = playData
        }
      }
      if (inDashboard) {
        const recipient = data.tokenData.revenueShareRecipients.find(
          (recipient) => recipient.recipientAuthority === dashboardPublicKey
        )
        const collectable = recipient?.owed > 0
        const collectableAmount = ninaClient.nativeToUiString(
          recipient?.owed,
          data.tokenData.paymentMint
        )

        const collectButton = (
          <StyledCollectButton
            disabled={!collectable}
            onClick={(e) => handleCollect(e, recipient, releasePubkey)}
            className={
              collectable
                ? 'collectable disableClickCapture'
                : 'disableClickCapture'
            }
          >
            Collect
            {collectable && <span>{collectableAmount}</span>}
          </StyledCollectButton>
        )
        formattedData.price = ninaClient.nativeToUiString(
          data.tokenData.price,
          data.tokenData.paymentMint
        )
        formattedData.remaining =
          data.tokenData.remainingSupply < 0
            ? infinityUnicode
            : `${data.tokenData.remainingSupply} / ${data.tokenData.totalSupply}`
        formattedData.collected = ninaClient.nativeToUiString(
          recipient?.collected + recipient?.owed,
          data.tokenData.paymentMint
        )
        formattedData.collect = collectButton
      }
      formattedData.authorityPublicKey = data.tokenData.authority
      formattedData.ctas = playData
    } else if (tableType === 'profileHubs') {
      formattedData = {
        id: releasePubkey,
        link: `/hubs/${data.handle}`,
        date: data?.createdAt,
        image: data?.data.image,
        hubName: data?.data.displayName,
        hubDescription: data?.data.description,
        publicKey: data?.publicKey,
        subscribe: true,
        handle: data?.handle,
      }
      if (inDashboard) {
        ;(formattedData.hubDashboard = `${process.env.NINA_HUBS_URL}/${data.handle}/dashboard`),
          (formattedData.hubExternal = `${process.env.NINA_HUBS_URL}/${data.handle}`)
      }
    } else if (tableType === 'hubReleases') {
      formattedData = {
        ...formattedData,
        id: data?.releasePubkey,
        image: data?.image,
        title: `${data?.properties.artist} - ${data?.properties.title}`,
        link: `/${data?.releasePubkey}`,
        date: data?.properties?.date,
        releaseDate: new Date(data?.properties?.date).toLocaleDateString(),
        authorityPublicKey: data?.authority,
        ctas: playData,
      }
    } else if (tableType === 'hubCollaborators') {
      formattedData = {
        link: `/profiles/${data.collaborator}`,
        image: displayImageForAccount(data.collaborator),
        collaborator: displayNameForAccount(data.collaborator),
        subscribe: true,
        publicKey: data.collaborator,
      }
    } else if (
      tableType === 'searchResultAccounts' ||
      tableType === 'filteredSearchResultAccounts'
    ) {
      formattedData = {
        image: data?.image ? data?.image : '/images/nina-gray.png',
        id: data?.publicKey,
        displayName: data?.displayName ? data?.displayName : data?.value,
        link: `/profiles/${data?.account}`,
      }
    } else if (
      tableType === 'searchResultReleases' ||
      tableType === 'filteredSearchResultReleases'
    ) {
      formattedData = {
        id: data?.publicKey,
        image: data?.image,
        link: `/${data?.publicKey}`,
        searchResultRelease: `${data?.artist} - ${data.title}`,
      }
    } else if (
      tableType === 'searchResultHubs' ||
      tableType === 'filteredSearchResultHubs'
    ) {
      formattedData = {
        id: data?.publicKey,
        image: data?.image,
        link: `/hubs/${data?.handle}`,
        searchResultHub: data.displayName,
      }
    } else if (tableType === 'followers') {
      formattedData = {
        link: `/profiles/${data.from.publicKey}`,
        image: displayImageForAccount(data.from.publicKey),
        profile: displayNameForAccount(data.from.publicKey),
        subscribe: true,
        publicKey: data.from.publicKey,
      }
    } else if (tableType === 'following') {
      if (data.subscriptionType === 'hub') {
        formattedData = {
          link: `/hubs/${data.to.handle}`,
          image: data.to.data.image,
          hub: data.to.data.displayName,
          subscribe: true,
          handle: data.to.handle,
          publicKey: data.to.publicKey,
        }
      } else if (data.subscriptionType === 'account') {
        formattedData = {
          link: `/profiles/${data.to.publicKey}`,
          image: displayImageForAccount(data.to.publicKey),
          profile: displayNameForAccount(data.to.publicKey),
          subscribe: true,
          publicKey: data.to.publicKey,
        }
      }
    } else if (tableType === 'defaultSearchReleases') {
      formattedData = {
        id: data?.releasePubkey,
        image: data?.metadata.image,
        link: `/${data?.releasePubkey}`,
        searchResultRelease: `${data?.metadata.properties.artist} - ${data.metadata.properties.title}`,
      }
    } else if (tableType === 'defaultSearchHubs') {
      formattedData = {
        id: data?.publicKey,
        image: data?.data.image,
        link: `/hubs/${data?.handle}`,
        searchResultHub: data?.data.displayName,
      }
    }
    return formattedData
  })

  return (
    <TableBody>
      {rows
        ?.slice()
        .sort(getComparator(order, orderBy))
        .map((row, i) => {
          return (
            <StyledTableRow
              key={i}
              hover
              sx={{ cursor: 'pointer' }}
              onClickCapture={(e) => openInNewTab(e, window, row?.link, router)}
            >
              {Object.keys(row).map((cellName, i) => {
                const cellData = row[cellName]
                if (
                  cellName !== 'id' &&
                  cellName !== 'date' &&
                  cellName !== 'uri' &&
                  cellName !== 'fileName' &&
                  cellName !== 'link' &&
                  cellName !== 'authorityPublicKey' &&
                  cellName !== 'publicKey' &&
                  cellName !== 'handle' &&
                  cellName !== 'artist' &&
                  cellName !== 'releaseName' &&
                  cellName !== 'description' &&
                  cellName !== 'external_url'
                ) {
                  if (cellName === 'ctas') {
                    return (
                      <StyledTableCellButtonsContainer
                        align="left"
                        key={i}
                        inCollection={inCollection}
                      >
                        <Button
                          sx={{ cursor: 'pointer' }}
                          id={row.id}
                          className="disableClickCapture"
                          onClickCapture={(e) =>
                            handleQueue(e, row.id, row.title)
                          }
                        >
                          <ControlPointIcon sx={{ color: 'black' }} />
                        </Button>
                        {inCollection && (
                          <Button
                            onClickCapture={(e) => {
                              e.stopPropagation()
                              downloadAs(
                                row,
                                row.id,
                                setDownloadId,
                                enqueueSnackbar,
                                walletAddress,
                                undefined,
                                true
                              )
                            }}
                            className="disableClickCapture"
                            disabled={downloadId === row.id}
                          >
                            {downloadId === row.id ? (
                              <Box sx={{ marginLeft: '8px' }}>
                                <Dots />
                              </Box>
                            ) : (
                              <DownloadIcon sx={{ color: 'black' }} />
                            )}
                          </Button>
                        )}
                      </StyledTableCellButtonsContainer>
                    )
                  } else if (cellName === 'image') {
                    return (
                      <StyledImageTableCell
                        align="left"
                        key={cellName}
                        className="imageCell"
                      >
                        <Box
                          sx={{
                            width: '50px',
                            textAlign: 'left',
                            pr: '15px',
                            position: 'relative',
                          }}
                        >
                          {row.ctas?.releasePubkey && (
                            <Button
                              sx={{
                                cursor: 'pointer',
                                position: 'absolute',
                                zIndex: 10,
                                height: '50px',
                                width: '50px',
                                margin: '0 auto',
                              }}
                              className="disableClickCapture"
                              onClickCapture={(e) => handlePlay(e, row.id)}
                              id={row.id}
                            >
                              {isPlaying && track.releasePubkey === row.id ? (
                                <PauseCircleOutlineOutlinedIcon
                                  sx={{ color: 'black' }}
                                />
                              ) : (
                                <PlayCircleOutlineOutlinedIcon
                                  sx={{ color: 'black' }}
                                />
                              )}
                            </Button>
                          )}
                          {row.image?.includes('https') ? (
                            <Image
                              height={50}
                              width={50}
                              layout="responsive"
                              src={getImageFromCDN(row.image, 100)}
                              alt={i}
                              loader={loader}
                            />
                          ) : (
                            <img src={row.image} height={50} width={50} />
                          )}
                        </Box>
                      </StyledImageTableCell>
                    )
                  } else if (cellName === 'hubDescription') {
                    return (
                      <HubDescription
                        description={cellData || null}
                        key={cellName}
                      />
                    )
                  } else if (cellName === 'title') {
                    return (
                      <StyledProfileTableCell key={cellName} type={'profile'}>
                        <OverflowContainer
                          inDashboard={inDashboard}
                          style={{ minWidth: '300px' }}
                        >
                          <Typography
                            sx={{ textDecoration: 'underline' }}
                            noWrap
                          >
                            <a>{cellData}</a>
                          </Typography>
                        </OverflowContainer>
                      </StyledProfileTableCell>
                    )
                  } else if (cellName === 'searchResultAccount') {
                    return (
                      <StyledProfileTableCell key={cellName} type={'profile'}>
                        <OverflowContainer overflowWidth={'20vw'}>
                          <Typography
                            noWrap
                            sx={{ hover: 'pointer', maxWidth: '20vw' }}
                          >
                            <a
                              onClickCapture={() => {
                                router.push(`/profiles/${row?.publicKey}`)
                              }}
                            >
                              {cellData}
                            </a>
                          </Typography>
                        </OverflowContainer>
                      </StyledProfileTableCell>
                    )
                  } else if (cellName === 'searchResultArtist') {
                    return (
                      <SearchResultTableCell key={cellName}>
                        <SearchResultOverflowContainer>
                          <Typography
                            noWrap
                            onClickCapture={() => router.push(row?.link)}
                          >
                            <a>{cellData}</a>
                          </Typography>
                        </SearchResultOverflowContainer>
                      </SearchResultTableCell>
                    )
                  } else if (cellName === 'searchResultRelease') {
                    return (
                      <SearchResultTableCell key={cellName}>
                        <SearchResultOverflowContainer>
                          <Typography
                            noWrap
                            onClickCapture={() => router.push(`/${row?.id}`)}
                          >
                            <a>{cellData}</a>
                          </Typography>
                        </SearchResultOverflowContainer>
                      </SearchResultTableCell>
                    )
                  } else if (cellName === 'searchResultHub') {
                    return (
                      <SearchResultTableCell key={cellName}>
                        <SearchResultOverflowContainer>
                          <Typography
                            noWrap
                            onClickCapture={() =>
                              router.push(`/hubs/${row?.id}`)
                            }
                          >
                            <a>{cellData}</a>
                          </Typography>
                        </SearchResultOverflowContainer>
                      </SearchResultTableCell>
                    )
                  } else if (cellName === 'price' || cellName === 'remaining') {
                    return (
                      <StyledTableCell key={cellName}>
                        <LineBreakContainer>
                          <Typography
                            sx={{
                              fontSize:
                                cellData === infinityUnicode
                                  ? '22px !important'
                                  : '',
                            }}
                          >
                            {cellData}
                          </Typography>
                        </LineBreakContainer>
                      </StyledTableCell>
                    )
                  } else if (cellName === 'collect') {
                    return (
                      <StyledTableCell key={cellName}>
                        <CollectContainer>
                          {collectId === row.id ? <Dots /> : cellData}
                        </CollectContainer>
                      </StyledTableCell>
                    )
                  } else if (cellName === 'hubDashboard') {
                    return (
                      <HubTableCell key={cellName}>
                        <CollectContainer>
                          <Link href={`${row?.hubDashboard}`} passHref>
                            <a
                              className="disableClickCapture"
                              target="_blank"
                              rel="noreferrer"
                            >
                              VIEW HUB DASHBOARD
                            </a>
                          </Link>
                        </CollectContainer>
                      </HubTableCell>
                    )
                  } else if (cellName === 'hubExternal') {
                    return (
                      <HubTableCell key={cellName}>
                        <CollectContainer>
                          <Link href={`${row?.hubExternal}`} passHref>
                            <a
                              className="disableClickCapture"
                              target="_blank"
                              rel="noreferrer"
                            >
                              VIEW HUB
                            </a>
                          </Link>
                        </CollectContainer>
                      </HubTableCell>
                    )
                  } else if (
                    cellName === 'releaseDate' ||
                    cellName === 'dateAdded'
                  ) {
                    return (
                      <ReleaseDateTableCell key={cellName}>
                        <Box sx={{ paddingLeft: '5px' }}>
                          <Typography>{cellData}</Typography>
                        </Box>
                      </ReleaseDateTableCell>
                    )
                  } else if (
                    cellName === 'subscribe' &&
                    row?.subscribe &&
                    walletConnected
                  ) {
                    return (
                      <TableCell key={cellName} sx={{ padding: '0 30px' }}>
                        <Subscribe
                          accountAddress={row.publicKey}
                          hubHandle={row?.handle}
                        />
                      </TableCell>
                    )
                  } else if (cellName === 'hub') {
                    return (
                      <StyledTableCell key={cellName}>
                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                          <OverflowContainer>
                            <Typography noWrap>{row?.hub}</Typography>
                          </OverflowContainer>
                          {row?.hub && <HubTag>HUB</HubTag>}
                        </Box>
                      </StyledTableCell>
                    )
                  } else {
                    return (
                      <StyledTableCell key={cellName}>
                        <OverflowContainer>
                          <Typography noWrap>{cellData}</Typography>
                        </OverflowContainer>
                      </StyledTableCell>
                    )
                  }
                }
              })}
            </StyledTableRow>
          )
        })}
    </TableBody>
  )
}

const infinityUnicode = '\u221e'

const ReusableTable = ({
  items,
  tableType,
  inDashboard,
  collectRoyaltyForRelease,
  refreshProfile,
  dashboardPublicKey,
  isActiveView,
  hasOverflow,
  minHeightOverride = false,
  inCollection,
  profileCollection,
  walletAddress,
  walletConnected,
}) => {
  const [order, setOrder] = useState('desc')
  const [orderBy, setOrderBy] = useState('')
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'

    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }
  return (
    <ResponsiveContainer
      hasOverflow={hasOverflow}
      minHeightOverride={minHeightOverride}
    >
      <ResponsiveTableContainer inDashboard={inDashboard}>
        <Table>
          {items?.length > 0 && (
            <ReusableTableHead
              tableType={tableType}
              inDashboard={inDashboard}
              onRequestSort={handleRequestSort}
              order={order}
              inCollection={inCollection}
              profileCollection={profileCollection}
              walletAddress={walletAddress}
              walletConnected={walletConnected}
            />
          )}
          <ReusableTableBody
            items={items}
            tableType={tableType}
            inDashboard={inDashboard}
            collectRoyaltyForRelease={collectRoyaltyForRelease}
            refreshProfile={refreshProfile}
            dashboardPublicKey={dashboardPublicKey}
            isActiveView={isActiveView}
            order={order}
            orderBy={orderBy}
            inCollection={inCollection}
            walletAddress={walletAddress}
            walletConnected={walletConnected}
          />
        </Table>
      </ResponsiveTableContainer>
    </ResponsiveContainer>
  )
}

const ResponsiveTableContainer = styled(Box)(({ theme, inDashboard }) => ({
  borderBottom: 'none',
  padding: '0px',
  [theme.breakpoints.down('md')]: {
    overflowY: 'unset',
    height: '100% !important',
    paddingLeft: '5px',
    paddingRight: 0,
    overflowX: inDashboard ? 'scroll' : '',
  },
  [theme.breakpoints.down('sm')]: {
    paddingTop: '10px',
  },
}))

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  padding: '5px 5px',
  textAlign: 'left',
  cursor: 'pointer',
  fontWeight: 'bold',
  borderBottom: 'none',
  [theme.breakpoints.down('md')]: {
    padding: '0px',
    paddingRight: '5px',
  },
  [theme.breakpoints.down('sm')]: {
    paddingTop: '10px',
  },
}))

const StyledTableCell = styled(TableCell)(({ theme, type }) => ({
  padding: '5px 0px',
  textAlign: 'left',
  height: '50px',
  width: '50vw',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    width: '30vw',
    paddingRight: '10px',
  },
}))
const StyledProfileTableCell = styled(TableCell)(({ theme }) => ({
  padding: '5px 5px',
  textAlign: 'left',
  height: '50px',
  width: '75vw',
  [theme.breakpoints.down('md')]: {
    width: '30vw',
    paddingRight: '10px',
  },
}))

const HubTableCell = styled(TableCell)(({ theme }) => ({
  width: '8vw',
}))

const ReleaseDateTableCell = styled(TableCell)(({ theme }) => ({
  width: '8vw',
  paddingLeft: '0px',
  textAlign: 'left',
}))

const StyledImageTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'left',
  padding: '5px',
  maxWidth: '100px',
  width: '50px',
}))
const StyledTableCellButtonsContainer = styled(TableCell)(({ theme }) => ({
  width: '150px',
  textAlign: 'left',
  padding: '5px 0px',
  textAlign: 'left',
  minWidth: '100px',
  [theme.breakpoints.down('md')]: {
    padding: '0px',
  },
}))
const SearchResultTableCell = styled(TableCell)(({ theme }) => ({
  padding: '5px',
  textAlign: 'left',
  height: '50px',
  [theme.breakpoints.down('md')]: {
    padding: '5px',
    width: '100vw',
    fontSize: '16px',
  },
}))
const OverflowContainer = styled(Box)(({ theme, inDashboard }) => ({
  overflow: 'hidden',
  maxWidth: inDashboard ? '170px' : '360px',
  textAlign: 'left',
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('md')]: {
    minWidth: '0',
    maxWidth: '20vw',
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: '10vw',
  },
}))

const CollectContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  maxWidth: '15vw',
  textAlign: 'left',
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('md')]: {
    minWidth: '0',
    maxWidth: '20vw',
  },
}))

const LineBreakContainer = styled(Box)(({ theme }) => ({
  '& p': {
    overflow: 'hidden',
    maxWidth: '100px',
    textAlign: 'left',
    whiteSpace: 'wrap',
    textOverflow: 'ellipsis',
  },
  [theme.breakpoints.down('md')]: {
    minWidth: '0',
    maxWidth: '20vw',
  },
}))

const StyledTableDescriptionContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '25vw',
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '.imageCell svg': {
    display: 'none',
  },
  '&:hover': {
    '.imageCell': {
      img: {
        opacity: '0.6',
      },
      svg: {
        display: 'block',
      },
    },
  },
}))

const ResponsiveContainer = styled(Box)(
  ({ theme, hasOverflow, minHeightOverride }) => ({
    width: theme.maxWidth,
    // maxHeight: hasOverflow ? 'auto' : 'unset',
    // webkitOverflowScrolling: 'touch',
    // minHeight: minHeightOverride ? 'unset' : '46vh',
    // overflowY: hasOverflow ? 'auto' : 'auto',
    overflowX: 'hidden',
    ['&::-webkit-scrollbar']: {
      display: 'none',
    },
    [theme.breakpoints.down('md')]: {
      width: '100vw',
      maxHeight: 'unset',
      overflowY: 'unset',
      overflowX: 'scroll',
    },
  })
)

const SearchResultOverflowContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  width: '70vw',
  textAlign: 'left',
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('md')]: {
    minWidth: '0',
    width: '80vw',
  },
}))
const StyledCollectButton = styled(Button)(({ theme }) => ({
  color: `${theme.palette.blue} !important`,
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
  ...theme.helpers.baseFont,
  '&.Mui-disabled': {
    color: `${theme.palette.grey.primary} !important`,
  },
  '& span': {
    color: `${theme.palette.grey.primary}`,
    fontSize: '10px',
  },
}))
const HubTag = styled(Typography)(({ theme }) => ({
  color: `${theme.palette.blue} !important`,
  cursor: 'default',
  padding: '0px 10px',
  fontSize: '10px !important',
}))
export default ReusableTable
