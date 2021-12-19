/* eslint-disable react/jsx-filename-extension */
import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";
import { ServerStyleSheets } from "@material-ui/styles";
// import createEmotionServer from '@emotion/server/create-instance';
// import createEmotionCache from '../src/createEmotionCache';
// import {styled} from '@mui/material/styles'

// const sheets = new ServerStyleSheets();
class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const styledComponentsSheet = new ServerStyleSheet();
    const materialSheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            styledComponentsSheet.collectStyles(
              materialSheets.collect(<App {...props} />)
            ),
        });
      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <React.Fragment>
            {initialProps.styles}
            {materialSheets.getStyleElement()}
            {styledComponentsSheet.getStyleElement()}
          </React.Fragment>
        ),
      };
    } finally {
      styledComponentsSheet.seal();
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <meta name="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="theme-color" content="#000000" />
          <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
          <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
          <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
          />

          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="shortcut icon"
            type="image/png"
            sizes="32x32"
            href="/public/favicon-32x32.png"
          />
          <link
            rel="shortcut icon"
            type="image/png"
            sizes="16x16"
            href="/public/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />

          <link
            rel="stylesheet"
            type="text/css"
            href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
          />
          <link
            rel="stylesheet"
            type="text/css"
            href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
          />
          <script src="https://cdn.dashjs.org/v3.2.1/dash.all.min.js" />
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-VDD58V1D22"
          />
          {() => {
            window.dataLayer = window.dataLayer || [];
            const gtag = () => window.dataLayer.push(arguments);
            gtag("js", new Date());
            gtag("config", "G-VDD58V1D22");
          }}
        </Head>
        <body style={{ margin: "0px", position: "relative" }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
export default MyDocument;
