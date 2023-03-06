export default function openInNewTab(event, window, url) {
    if (event.ctrlKey || event.metaKey) {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
      if (newWindow) newWindow.opener = null
    }
}