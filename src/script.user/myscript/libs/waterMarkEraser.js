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

    /* 通过判断是否存在众多设置为pointerEvents的元素来进一步确认其子节点是否存在水印特征 */
    const childNodes = el.querySelectorAll('*')
    let hasPointerEventsElCount = 0

    if (childNodes.length > 20) {
      childNodes.forEach(child => {
        const style = window.getComputedStyle(child)
        if (style.pointerEvents === 'none') {
          hasPointerEventsElCount++
        }
      })

      if (hasPointerEventsElCount > childNodes.length * 0.7) {
        result = true
      }
    }

    if (!result) {
      console.log('[waterMarkEraser]', '发现watermark的相关标签，但未匹配已定义的水印特征', el)
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
            setTimeout(() => { node.style.display = 'none' }, 0)

            /* 延迟再次隐藏，防止水印被重新显示 */
            setTimeout(() => { node.style.display = 'none' }, 1200)

            console.log('[waterMarkEraser]', node)
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
