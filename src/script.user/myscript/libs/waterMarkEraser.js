/*!
 * @name         waterMarkEraser.js
 * @description  水印清除工具
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/05/25 14:03
 * @github       https://github.com/xxxily
 */

function hasWaterMarkFeature (el) {
  if (!el) {
    return false
  }

  let result = false

  if (el.className && typeof el.className === 'string') {
    const className = el.className.toLowerCase().replace(/[-_]/g, '')
    if (className.indexOf('watermark') > -1) {
      result = true
    }
  } else if (el.id && typeof el.id === 'string') {
    if (el.id.toLowerCase().indexOf('watermark') > -1) {
      result = true
    }
  }

  // 进一步确认是否符合水印特征
  if (result) {
    const style = window.getComputedStyle(el)
    if (style.pointerEvents !== 'none') {
      result = false
    }
  }

  return result
}

function waterMarkEraser (shadowRoot) {
  const mObserver = new MutationObserver((mutationsList, observer) => {
    mutationsList.forEach(mutation => {
      if (mutation.addedNodes) {
        mutation.addedNodes.forEach(node => {
          if (hasWaterMarkFeature(node)) {
            console.log('[waterMarkEraser]', node)
            node.style.display = 'none'
          }
        })
      }
    })
  })

  const docRoot = shadowRoot || window.document.documentElement
  mObserver.observe(docRoot, {
    childList: true,
    subtree: true
  })
}

export default waterMarkEraser
