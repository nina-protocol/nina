import gtag from 'ga-gtag'

export const trackEvent = (action, category, fields) => {
  gtag('event', action, {
    event_category: category,
    ...fields,
    app: process.env.APP_NAME
  }) 
}