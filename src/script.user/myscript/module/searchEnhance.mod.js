/*!
 * @name         searchEnhance.mod.js
 * @description  搜索增强插件
 * @version      0.0.1
 * @author       Blaze
 * @date         2021/1/12 10:38
 * @github       https://github.com/xxxily
 */

// import { ready, parseURL } from '../../../libs/utils'
// import monkeyMenu from '../../common/monkeyMenu'

(function () {
  function loadSheet () {
    const sheet = `
            /* 谷歌右侧栏 */
            #rhs {
                display: none !important;
            }
            /* 百度右侧栏 */
            #content_right {
                display: none !important;
            }
            /* 必应右侧栏 */
            #b_context {
                display: none !important;
            }

            /* 搜索引擎div正常展示状态的样式 */
            .search-engine-div {
                position: absolute;
                overflow: hidden;
                border: 0px;
                border-left: 1px solid #F5F5F5;
            }
            /* 搜索引擎div最大化状态下的样式 */
            .search-engine-div-max {
                position: fixed !important;
                top: 0px !important;
                left: 0px !important;
                right: 0px !important;
                margin: auto !important;
                width: 90% !important;
                height: 100% !important;
                border: 0px solid #F5F5F5 !important;
                box-shadow: 0px 0px 10px #BBB !important;
                z-index: 10000 !important;
            }
            /* 搜索引擎iframe正常展示的样式 */
            .search-engine-iframe {
                border: 0px;
            }
            /* 搜索引擎iframe最大化状态的样式 */
            .search-engine-iframe-max {
                margin: 0px !important;
                width: 100% !important;
                height: 100% !important;
                border: 0px !important;
            }
            /* 搜索引擎最大化按钮 */
            .max-button {
                position: absolute;
                top: 2px;
                right: 8px;
                height: 16px;
                opacity: 0.5;
            }
            .max-button:hover {
                cursor: pointer;
                height: 18px;
                opacity: 0.7;
            }
        `
    const css = document.createElement('style')
    css.id = 'multi-search-css'
    css.textContent = sheet
    document.getElementsByTagName('head')[0].appendChild(css)
  }

  /* 多搜索引擎同时搜索并排显示 */
  function multiSearch () {
    function isUrlMatched (urlRegex) {
      const windowUrl = window.location.href
      return urlRegex.test(windowUrl)
    }

    function getQuery (inputPath) {
      const query = document.evaluate(inputPath, document, null, 9, null).singleNodeValue.value.trim()
      return encodeURIComponent(query)
    }

    function removeElements (ids) {
      for (let i = 0; i < ids.length; i++) {
        const e = document.getElementById(ids[i])
        if (e) {
          e.parentNode.removeChild(e)
        }
      }
    }

    function doOneSearch (
      id, // 搜索引擎标识
      url, // 搜索引擎URL
      query, // 搜索文本
      displayDivTop, // 显示区域div距离文档顶部距离
      displayDivLeft, // 显示区域div距离文档左侧距离
      displayDivWidth, // 显示区域div宽度
      displayDivHeight, // 显示区域div高度
      iframeMarginTop, // iframe相对于显示区域需要调整的高度
      iframeMarginLeft // iframe相对于显示区域需要调整的宽度
    ) {
      // 创建显示区域div
      const div = document.createElement('div')
      div.id = id + '-div'
      div.className = 'search-engine-div'
      div.style.top = displayDivTop + 'px'
      div.style.left = displayDivLeft + 'px'
      div.style.width = displayDivWidth + 'px'
      div.style.height = displayDivHeight + 'px'
      document.body.appendChild(div)

      // 创建搜索引擎iframe
      const iframe = document.createElement('iframe')
      iframe.id = id + '-iframe'
      iframe.className = 'search-engine-iframe'
      iframe.style.marginTop = iframeMarginTop + 'px'
      iframe.style.marginLeft = iframeMarginLeft + 'px'
      iframe.style.width = (displayDivWidth - iframeMarginLeft) + 'px'
      iframe.style.height = (displayDivHeight - iframeMarginTop) + 'px'
      iframe.scrolling = 'no'
      iframe.src = url.replace('%s', query)
      div.appendChild(iframe)

      // 创建搜索引擎最大化按钮
      let buttonFlag = 0
      const maxButton = document.createElement('img')
      maxButton.id = id + '-max-button'
      maxButton.className = 'max-button'
      // 直接放base64的image数据即可, 不需要url()包含, 否则Firefox不能读取
      maxButton.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAmVBMVEUAAAAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyAjHyD////5G4h8AAAAMnRSTlMAAAEXHx4bAwIZa9jj31tE2Wwt6vzkSNo/+sgmwAcJwTz7vgi9EoBVU38WiD79LutyBM7eRsEAAAABYktHRDJA0kzIAAAAB3RJTUUH5AcdADskUeOrjwAAAM5JREFUOMutk+kOgjAQhNmCooIol3IfIh6c+v4vZ1sjUSkpCcy/Tr62292pIEwXfKlvkQUSpQXRUu6A1ZpYkogwAfJGUam2Wgfs9tRRdLwHDNOy/4HDkRi2ZRoYcFzPZ1/he65DgSBkFxkGHyAC5vOi0UA8BMQUSNJTxgbCc5pgIL9cgQ3A7Z6D8FM+YwYzDFMYPuczTU4NUJQaYgNIKwsMVHUw0IcsqKsxnZxjWHyAFxhO5Jo2tdmpttO2IbHX+7F/p1pVHk/gfxzu15usF/ijFJMuEdtwAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIwLTA3LTE5VDAzOjM5OjIwKzAwOjAwhmcOXAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wMS0wOFQxOTowMToxOSswMDowMK3Uf0kAAAAgdEVYdHNvZnR3YXJlAGh0dHBzOi8vaW1hZ2VtYWdpY2sub3JnvM8dnQAAABh0RVh0VGh1bWI6OkRvY3VtZW50OjpQYWdlcwAxp/+7LwAAABh0RVh0VGh1bWI6OkltYWdlOjpIZWlnaHQANTEyj41TgQAAABd0RVh0VGh1bWI6OkltYWdlOjpXaWR0aAA1MTIcfAPcAAAAGXRFWHRUaHVtYjo6TWltZXR5cGUAaW1hZ2UvcG5nP7JWTgAAABd0RVh0VGh1bWI6Ok1UaW1lADE1NDY5NzQwNznwyEyKAAAAEXRFWHRUaHVtYjo6U2l6ZQA1MDg2QjMNnD4AAABadEVYdFRodW1iOjpVUkkAZmlsZTovLy9kYXRhL3d3d3Jvb3Qvd3d3LmVhc3lpY29uLm5ldC9jZG4taW1nLmVhc3lpY29uLmNuL2ZpbGVzLzExMy8xMTM4NDM4LnBuZ2oVcREAAAAASUVORK5CYII='
      maxButton.onclick = function (event) {
        if (buttonFlag == 0) {
          div.className = 'search-engine-div-max'
          iframe.className = 'search-engine-iframe-max'
          iframe.scrolling = 'auto'
        } else {
          div.className = 'search-engine-div'
          iframe.className = 'search-engine-iframe'
          iframe.scrolling = 'no'
        }
        buttonFlag = 1 - buttonFlag
      }
      // 当搜索引擎最大化时, 点击搜索引擎div外面, 取消最大化.
      // 此处不能使用 window.onclick=... 因为可能添加多个搜索引擎, onclick会覆盖, addEventListener每次添加的都会执行.
      window.addEventListener('click', function (event) {
        if (event.target != maxButton && buttonFlag == 1) {
          div.className = 'search-engine-div'
          iframe.className = 'search-engine-iframe'
          iframe.scrolling = 'no'
          buttonFlag = 1 - buttonFlag
        }
      }, true)
      div.appendChild(maxButton)
    }

    // 谷歌 + 百度
    function googlePageMultiSearch () {
      const docWidth = document.body.scrollWidth
      const docHeight = document.body.scrollHeight
      const query = getQuery('//input[@name="q"]')

      // 百度
      // 一次搜索10条
      doOneSearch('baidu', 'https://www.baidu.com/s?wd=%s&rn=10', query, 150, docWidth - 595, 583, docHeight - 235, -107, -120)
      // 一次搜索20条
      // doOneSearch('baidu', 'https://www.baidu.com/s?wd=%s&rn=20', query, 150, docWidth - 595, 583, docHeight * 2 - 500, -107, -120);

      // StackOverflow(谷歌)
      // doOneSearch('stackoverflow_google', 'https://www.google.com/search?q=%s+site%3Astackoverflow.com&num=10&igu=1&newwindow=1', query, 138, docWidth, 710, docHeight - 220, -138, -150);
    }
    if (isUrlMatched(/^https?:\/\/www\.google(?:\.[A-z]{2,3}){1,2}\/[^?]+\?(?!tbm=)(?:&?q=|(?:[^#](?!&tbm=))+?&q=)(?:.(?!&tbm=))*$/)) {
      googlePageMultiSearch()
    }

    // 百度 + 谷歌
    //
    // 百度极速搜索比较特殊, 不仅页面不刷新, url可能都不变, 而直接展示搜索结果.
    // 所以, 此处用右侧栏元素是否存在来判断搜索结果是否变动.
    //
    // PS: 如果要使用MutationObserver监听百度页面, 由于百度页面将MutationObserver置为了null, 可参考下面将其还原回来:
    //     - https://stackoverflow.com/questions/61675836/window-mutationobserver-is-null-in-web-page
    //     - https://stackoverflow.com/questions/7089443/restoring-console-log/7089553#7089553
    function baiduPageMultiSearch () {
      if (!document.getElementById('content_right')) {
        return
      }
      removeElements(['content_right'])
      if (!document.getElementById('search-engine-css')) {
        loadSheet()
      }
      const docWidth = document.body.scrollWidth
      const docHeight = document.body.scrollHeight
      const query = getQuery('//input[@id="kw"]')

      // 谷歌
      // 加入参数 igu=1 使谷歌可以在iframe中显示, 否则会被Google拒绝
      // 加入参数 newwindow=1 使谷歌搜索结果默认新窗口打开
      // 一次搜索10条
      doOneSearch('google', 'https://www.google.com/search?q=%s&num=10&igu=1&newwindow=1', query, 112, docWidth - 711, 710, docHeight - 220, -138, -150)
      // 一次搜索20条
      // doOneSearch('google', 'https://www.google.com/search?q=%s&num=20&igu=1&newwindow=1', query, 112, docWidth - 711, 710, docHeight * 2 - 200, -138, -150);
    }
    if (isUrlMatched(/^https?:\/\/www\.baidu\.com\//)) { // 极速搜索状态, url甚至可能是百度主页
      baiduPageMultiSearch()
      window.setInterval(baiduPageMultiSearch, 300)
    }

    // 必应 + 百度
    function bingPageMultiSearch () {
      const docWidth = document.body.scrollWidth
      const docHeight = document.body.scrollHeight
      const query = getQuery('//input[@id="sb_form_q"]')

      // 百度
      doOneSearch('baidu', 'https://www.baidu.com/s?wd=%s&rn=10', query, 167, docWidth - 650, 590, docHeight - 250, -107, -120)
    }
    if (isUrlMatched(/^https?:\/\/[^.]*\.bing\.com\/search/)) {
      bingPageMultiSearch()
    }
  }

  /* 避免在iframe中嵌套调用 */
  if (window.self !== window.top) {
    return false
  }

  loadSheet()
  const docReady = document.readyState === 'interactive' || document.readyState === 'complete' || document.readyState === 'loaded'
  if (docReady) {
    multiSearch()
  } else {
    window.addEventListener('DOMContentLoaded', multiSearch, true)
  }
})()

export default {
  setup (addTaskMap) {
    //
  }
}
