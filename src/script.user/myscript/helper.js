function saveCanvas (title) {
  title = title || 'videoCapturer_' + Date.now()
  const canvas = document.querySelector('canvas#pixie-canvas')
  canvas.toBlob(function (blob) {
    const el = document.createElement('a')
    el.download = `${title}.png`
    el.href = URL.createObjectURL(blob)
    el.click()
  }, 'image/png', 0.8)
}
saveCanvas()

/**
 * createObjectURL
 * getCanvasBlob
 * pixie.saveUrl
 */
document.querySelectorAll('canvas')
