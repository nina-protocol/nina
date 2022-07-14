import Hubs from "../components/Hubs";
import Head from "next/head";

// export const config = {amp: 'hybrid'}


export default function Home() {
  return (
    <>
      <Head>
        <title>Nina Hubs</title>
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
      </Head>
      <Hubs />
    </>
  );
}
