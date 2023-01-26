import gtag from 'ga-gtag'
import * as Sentry from "@sentry/browser";

export const logEvent = (action, category, params = {}) => {
  gtag('event', action, {
    event_category: category,
    ...params,
  })
  Sentry.addBreadcrumb({
    category,
    message: action,
    level: action.includes('failure') ? 'error' : 'info',
    data: params
  });  
}
