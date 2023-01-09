import * as wrapee from '/Users/michaelpollard/Nina/nina/js/web/pages/_app.js';
export * from '/Users/michaelpollard/Nina/nina/js/web/pages/_app.js';
import * as Sentry from '@sentry/nextjs';

/**
 * This file is a template for the code which will be substituted when our webpack loader handles non-API files in the
 * `pages/` directory.
 *
 * We use `/Users/michaelpollard/Nina/nina/js/web/pages/_app.js` as a placeholder for the path to the file being wrapped. Because it's not a real package,
 * this causes both TS and ESLint to complain, hence the pragma comments below.
 */

const userPageModule = wrapee ;

const pageComponent = userPageModule.default;

const origGetInitialProps = pageComponent.getInitialProps;
const origGetStaticProps = userPageModule.getStaticProps;
const origGetServerSideProps = userPageModule.getServerSideProps;

const getInitialPropsWrappers = {
  '/_app': Sentry.withSentryServerSideAppGetInitialProps,
  '/_document': Sentry.withSentryServerSideDocumentGetInitialProps,
  '/_error': Sentry.withSentryServerSideErrorGetInitialProps,
};

const getInitialPropsWrapper = getInitialPropsWrappers['/_app'] || Sentry.withSentryServerSideGetInitialProps;

if (typeof origGetInitialProps === 'function') {
  pageComponent.getInitialProps = getInitialPropsWrapper(origGetInitialProps) ;
}

const getStaticProps =
  typeof origGetStaticProps === 'function'
    ? Sentry.withSentryGetStaticProps(origGetStaticProps, '/_app')
    : undefined;
const getServerSideProps =
  typeof origGetServerSideProps === 'function'
    ? Sentry.withSentryGetServerSideProps(origGetServerSideProps, '/_app')
    : undefined;

export { pageComponent as default, getServerSideProps, getStaticProps };
