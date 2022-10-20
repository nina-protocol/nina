import gtag from 'ga-gtag'

export const logEvent = (action, category, fields) => {
  gtag('event', action, {
    event_category: category,
    ...fields
  }) 
}