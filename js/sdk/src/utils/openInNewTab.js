export default function openInNewTab(event, window, url, router) {
  if (!event.target.closest('button, a')?.classList.contains('disableClickCapture')) {
    if (event.ctrlKey || event.metaKey) {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
      if (newWindow) newWindow.opener = null
    } else {
      router.push(url)
    }
  }
}
