import React, { Fragment, useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Link from 'next/link'
import ScrollablePageWrapper from './ScrollablePageWrapper'
import Image from 'next/image'
import LocalizedStrings from 'react-localization'

const stringFormatter = {
  faqAnswer5: {
    arweave: (
      <Link href="https://arweave.org">
        <a target={'_blank'}>Arweave</a>
      </Link>
    ),
  },
  faqAnswer6: {
    phantom: (
      <Link href="https://phantom.app">
        <a target={'_blank'}>Phantom</a>
      </Link>
    ),
    coinbase: (
      <Link href="https://wallet.coinbase.com">
        <a target={'_blank'}>Coinbase</a>
      </Link>
    ),
  },
}

const LearnMore = () => {
  let copyStrings = new LocalizedStrings({
    en: {
      title: 'Learn More',
      header1:
        ' Nina is an independent music ecosystem that offers artists new models for releasing music. Below you can learn more about how it works and see a list of FAQs.',
      header2: 'How you can use Nina',
      exampleHeader1: 'Limited Editions',
      exampleBody1:
        'Release a limited quantity of your release. You can set the number of editions you want to release when publishing.',
      exampleImage1: '/images/LimitedEdition.png',
      exampleLink1:
        'https://ninaprotocol.com/Hy42kGTy6HqJgTkBcvb8YoUjgwP46TLqbpz9nWHSHomM',
      exampleLinkText1: 'Surgeon, Jet Pack Mack',
      exampleHeader2: 'Open Editions',
      exampleBody2:
        'Create an unlimited supply of your release. You can close the sale at any time and your release will be sold out.',
      exampleImage2: '/images/OpenEdition.png',
      exampleLink2:
        'https://ninaprotocol.com/8etCo8Gso93PLLjZeXWubjdm4Qd5NqLGL8qtHm76x5cN',
      exampleLinkText2: 'Dasychira, Banyan Tree',
      exampleHeader3: 'Closed Editions',
      exampleBody3: `Close the sale of your release at any time (possible for limited and open editions). The release will then be sold out, but it can still be sold on the secondary market.`,
      exampleImage3: '/images/ClosedEdition.png',
      exampleLink3:
        'https://ninaprotocol.com/7oR7ETJW9QYXWm25mgLjP4kTRmjPGgQsH4HP1uwDGyKW',
      exampleLinkText3: 'dBridge, Private Skies',
      exampleHeader4: 'Gates',
      exampleBody4: `Include additional material only available to fans who purchase your release—lossless files, bonus tracks, videos, PDFs, etc.`,
      exampleImage4: '/images/Gates.png',
      exampleLink4:
        'https://ninaprotocol.com/2QfDZcQnT51mQTFrWfzKTPPDrB7G3rk5fSif1WTA7Dqd',
      exampleLinkText4: 'gantz, evoker',
      exampleHeader5: 'Editorial',
      exampleBody5: `Share additional context around your releases or make blog posts to share updates, stories, and musings with your community.`,
      exampleImage5: '/images/Posts.png',
      exampleLink5: `https://hubs.ninaprotocol.com/ledisko/posts/8BEauXrASkugBm6gR4wkH3T5RU5JAuwLwybkfbF1Pg7W`,
      exampleLinkText5: `Gesloten Cirkel, Detoon`,
      faqHeader: 'FAQs',
      faqQuestion1: 'What can I release on Nina?',
      faqAnswer1:
        'Anything. Tracks, live sets, demos, b-sides, podcasts, recordings of your fireplace, etc',

      faqQuestion2: 'Do my releases on Nina need to be exclusive?',
      faqAnswer2:
        'No. You can release your music anywhere else, Nina is another home for your music, like Bandcamp and SoundCloud. Open Editions are an easy way to release music that is available elsewhere.',

      faqQuestion3: 'Do I have to pay to start using Nina?',
      faqAnswer3:
        'No. We also cover costs for artists and label to get set up, helping you get storage space and bandwidth for your releases.',

      faqQuestion4: 'Can I make my releases free?',
      faqAnswer4: 'Yes. Just set the price to 0 when you publish.',
      faqQuestion5: 'Why is Nina built on the blockchain?',
      faqAnswer5: `Nina utilizes the blockchain to allow artists to have the most
          control over their work. Publishing music on-chain allows artists to
          side-step platform fees and keep 100% of their sales. The technology
          enables easy revenue split automation, royalties on resales, shared
          pages with collaborators, and permanent web archiving via hosting on {arweave}. We know a lot of artists are rightfully skeptical about anything
          blockchain-related, so we try to help them get comfortable with our
          tools so they can decide whether it's for them or not.`,
      faqQuestion6: 'How do you buy music on Nina?',
      faqAnswer6:
        'You need a Solana wallet (we recommend {phantom}) funded with SOL or USDC to purchase music on Nina. To fund a wallet, you can either purchase SOL with a credit card from inside the Phantom wallet, or you can buy SOL on an exchange like {coinbase} and send it to your Phantom wallet.',
    },

    jp: {
      title: 'Learn More',
      header1:
        'Ninaは楽曲をリリースすることに対してアーティストに新しいモデルを提供するインディペンデント・ミュージック・エコシステムです。下記はどのように機能するかとFAQのリストになっています。',
      header2: 'どのようにNinaを利用するか。',
      exampleHeader1: 'Limited Editions (リミテッド・エディション)',
      exampleBody1:
        'あなたのリリースの限定された数量をリリースする。出版する時にリリースする数量を決めることができます。',
      exampleImage1: '/images/LimitedEdition.png',
      exampleLink1:
        'https://ninaprotocol.com/Hy42kGTy6HqJgTkBcvb8YoUjgwP46TLqbpz9nWHSHomM',
      exampleLinkText1: 'Surgeon, Jet Pack Mack',
      exampleHeader2: 'Open Editions (オープン・エディション)',
      exampleBody2:
        '無制限のリリースを作成する。販売をいつでも止めて、リリースをソールドアウトさせることができます。',
      exampleImage2: '/images/OpenEdition.png',
      exampleLink2:
        'https://ninaprotocol.com/8etCo8Gso93PLLjZeXWubjdm4Qd5NqLGL8qtHm76x5cN',
      exampleLinkText2: 'Dasychira, Banyan Tree',
      exampleHeader3: ' Closed Editions (クローズド・エディション)',
      exampleBody3: `あなたのリリースの販売を止める（リミテッド・エディションとオープン・エディションでも可能）。そのリリースはソールドアウトになりますが、二次マーケットでは売られることができます。`,
      exampleImage3: '/images/ClosedEdition.png',
      exampleLink3:
        'https://ninaprotocol.com/7oR7ETJW9QYXWm25mgLjP4kTRmjPGgQsH4HP1uwDGyKW',
      exampleLinkText3: 'dBridge, Private Skies',
      exampleHeader4: 'Gates (ゲート)',
      exampleBody4: `あなたのリリースを購入したファンのみに利用可能なロスレスなファイルや、ボーナストラック、ビデオ、PDFsなど追加マテリアルを含むことができます。`,
      exampleImage4: '/images/Gates.png',
      exampleLink4:
        'https://ninaprotocol.com/2QfDZcQnT51mQTFrWfzKTPPDrB7G3rk5fSif1WTA7Dqd',
      exampleLinkText4: 'gantz, evoker',
      exampleHeader5: 'Editorial',
      exampleBody5: `Share additional context around your releases or make blog posts to share updates, stories, and musings with your community.`,
      exampleImage5: '/images/Posts.png',
      exampleLink5: `https://hubs.ninaprotocol.com/ledisko/posts/8BEauXrASkugBm6gR4wkH3T5RU5JAuwLwybkfbF1Pg7W`,
      exampleLinkText5: `Gesloten Cirkel, Detoon`,
      faqHeader: 'FAQs',
      faqQuestion1: 'Ninaでは何をリリースできますか？',
      faqAnswer1:
        'なんでもできます。トラック、ライブセット、デモ、b-sides、ポッドキャスト、暖炉のレコーディングでも',
      faqQuestion2: 'NinaでのリリースはNinaのみである必要がありますか?',
      faqAnswer2:
        'いいえ。他のどこにでも楽曲をリリースできます。Ninaはあなたの楽曲のBandcampやSoundCloundのようなもう一つの家です。オープン・エディションは他の場所でも利用可能な音楽をリリースするのに簡単な方法です。',
      faqQuestion3: 'Ninaを使うには料金がかかりますか？',
      faqAnswer3:
        ' いいえ。私たちがアーティストやレーベルをセットアップするためのコストをカバーし、ストレージスペースを確保するのを助け、あなたのリリースを引き受けます。',
      faqQuestion4: 'リリースを無料にセッティングできますか？',
      faqAnswer4: ' はい。出版する時に単純に料金を０に設定してください。',
      faqQuestion5: ' なぜNinaはブロックチェーン上に作成されているのか。',
      faqAnswer5:
        'Ninaはアーティストが彼らの作品に対して最もコントロール出来るようにブロックチェーンを使用しています。チェーン上に出版することでアーティストはプラットフォームフィーを回避し、セールスを100%キープできます。そのテクノロジーは簡単な収益振分自動操作、転売のロイヤルティー、コラボレーターとの共有ページ、{arweave}を通じての永久的ウェブアーカイブを可能とさせます。私たちはたくさんのアーティストが当然にブロックチェーンに関することについて懐疑的であることを理解しています。私たちはアーティストが私たちのツールに快適になれるように手助けをします、そしてアーティストは使用するか使用しないか決めることができます。',
      faqQuestion6: 'どうやってNinaで楽曲を購入しますか？',
      faqAnswer6:
        'あなたはSOLかUSDCを供給されたSolanaウォレットが必要です（{phantom}を推奨します）。ウォレットを供給するには、あなたはPhantomウォレットの中からクレジットカードでSOLを購入するか、または{coinbase}のような為替でSOLを購入し、あなたのPhantomウォレットへ送ることができます。',
    },
  })
  // to toggle between eng and jp uncomment the setLanguage function
  // copyStrings.setLanguage('jp')

  return (
    <ScrollablePageWrapper>
      <StyledGrid>
        <LearnMoreWrapper>
          <Box mb={2}>
            <Typography variant="h2">{copyStrings.header1}</Typography>
          </Box>
          <Box mt={2} mb={1}>
            <Typography variant="h3" sx={{ textDecoration: 'underline' }}>
              {copyStrings.header2}
            </Typography>
            {[...Array(5)].map((_, index) => {
              const example = (element) => {
                return copyStrings[`example${element}${index + 1}`]
              }
              return (
                <ExampleContainer key={index}>
                  <ExampleHeader variant="h2">
                    {example('Header')}
                  </ExampleHeader>
                  <ExampleBody variant="h4">{example('Body')}</ExampleBody>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Link href={example('Link')}>
                      <a target="_blank" style={{ width: 'max-content' }}>
                        <Typography marginBottom={'15px'}>
                          {example('LinkText')}
                        </Typography>
                      </a>
                    </Link>
                    <Box
                      sx={{
                        border: '1px solid black',
                        width: '66%',
                        marginBottom: '15px',
                        padding: '15px',
                        width: { xs: '90%', sm: '66%' },
                      }}
                    >
                      <Link href={example('Link')}>
                        <a target="_blank">
                          <Image
                            layout="responsive"
                            width={660}
                            height={404}
                            src={example('Image')}
                            alt={example('LinkText')}
                            style={{
                              objectFit: 'contain',
                              width: '90%',
                              height: 'auto',
                            }}
                            loader={({ src }) => {
                              return src
                            }}
                          />
                        </a>
                      </Link>
                    </Box>
                  </Box>
                </ExampleContainer>
              )
            })}

            <Box mb={2}>
              <Typography variant="h2">{`FAQ`}</Typography>
              {[...Array(7)].map((_, index) => {
                const faqs = (element) => {
                  const elementString = `faq${element}${index + 1}`
                  if (stringFormatter[elementString]) {
                    return copyStrings.formatString(
                      copyStrings[elementString],
                      stringFormatter[elementString]
                    )
                  }
                  return copyStrings[`faq${element}${index + 1}`]
                }
                return (
                  <FaqBox key={index}>
                    <Typography
                      variant="h3"
                      fontWeight={'bold'}
                      style={{ marginBottom: '15px' }}
                    >
                      {faqs('Question')}
                    </Typography>
                    <Box sx={{ paddingLeft: { xs: '0px', md: '15px' } }}>
                      <Typography
                        variant=""
                        fontWeight={'normal'}
                        sx={{ width: '50%' }}
                      >
                        {faqs('Answer')}
                      </Typography>
                    </Box>
                  </FaqBox>
                )
              })}
            </Box>
          </Box>
        </LearnMoreWrapper>
      </StyledGrid>
    </ScrollablePageWrapper>
  )
}

const StyledGrid = styled(Grid)(({ theme }) => ({
  paddingTop: '20px',
  maxHeight: '90vh',
  justifyContent: 'center',
  alignItems: 'center',
  '& a': {
    textDecoration: 'none',
    color: theme.palette.blue,
    '&:hover': {
      opacity: '85%',
    },
  },
}))

const LearnMoreWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: '100px auto ',
  display: 'flex',
  flexDirection: 'column',
  gridColumn: '1/3',
  maxWidth: '1000px',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    width: '80%',
    margin: '25px auto',
    paddingBottom: '100px',
  },
}))

const FaqBox = styled(Box)(({ theme }) => ({
  width: '50%',
  marginTop: '15px',
  marginBottom: '15px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}))

const ExampleHeader = styled(Typography)(({ theme }) => ({
  marginTop: '30px',
  fontSize: '30px !important',
  [theme.breakpoints.down('md')]: {
    fontSize: '20px !important',
  },
}))

const ExampleBody = styled(Typography)(({ theme }) => ({
  marginTop: '15px',
  marginBottom: '15px',
  width: '50%',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}))

const ExampleContainer = styled(Box)(() => ({
  marginBottom: '30px',
}))

export default LearnMore
