import gtag from 'ga-gtag'

export const logEvent = (action, category, params = {}) => {
  gtag('event', action, {
    event_category: category,
    ...params,
  })
}
