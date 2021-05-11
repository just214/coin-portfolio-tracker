import Head from "next/head";
export type LayoutProps = {
  /**
   * Optionally render children
   */
  children?: React.ReactNode;
};

export const Layout = (props: LayoutProps) => {
  const { children } = props;
  return (
    <main className="container mx-auto px-1 md:px-32 lg:px-64 xl:px-96 mb-12">
      <Head>
        <title>Cointail</title>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png"></link>
        <link
          rel="apple-touch-icon-precomposed"
          sizes="144x144"
          href="/apple-touch-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="152x152"
          href="/apple-touch-icon-152x152.png"
        />
        <link
          rel="icon"
          type="image/png"
          href="/cointel-icon.svg"
          sizes="32x32"
        />
        <link
          rel="icon"
          type="image/png"
          href="/cointel-icon.svg"
          sizes="16x16"
        />
        <meta name="application-name" content="Cointail" />
        <meta name="msapplication-TileColor" content="#f5f5f5" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cointail" />
        <link rel="manifest" href="/public/manifest.json" />
      </Head>
      {children}
    </main>
  );
};
