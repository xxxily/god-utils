import { isRegExp } from '../../../libs/utils/typeof'
// import { proxy } from './xhrHook'

function fetchHook (callback) {
  // const fetchHookList = window._fetchHookList || []
  // window._fetchHookList = fetchHookList

  if (window._realFetch) {
    return true
  }

  window._realFetch = window.fetch

  window.fetch = async function () {
    if (callback instanceof Function) {
      try {
        const hookResult = callback(arguments)

        // 阻止请求
        if (hookResult === false) {
          // console.info('[fetchHook block]', arguments)
          return false
        }
      } catch (e) {
        console.error('[fetchHook error]', e)
      }
    }

    return window._realFetch.apply(window, arguments)
  }
}

function xhrHook (callback) {
  if (window._realXhr) {
    return true
  }

  window._realXhr = window.XMLHttpRequest

  window.XMLHttpRequest = function () {
    const xhr = new window._realXhr()

    const xhrConf = {}

    const realOpen = xhr.open
    xhr.open = function () {
      xhrConf.method = arguments[0]
      xhrConf.url = arguments[1]
      xhrConf.async = arguments[2]
      xhrConf.user = arguments[3]
      xhrConf.password = arguments[4]

      return realOpen.apply(xhr, arguments)
    }

    const realSend = xhr.send
    xhr.send = function () {
      if (callback instanceof Function) {
        const result = callback(xhrConf)

        // 阻止请求
        if (result === false) {
          // console.info('[xhrHook block]', arguments)
          return false
        }
      }

      return realSend.apply(xhr, arguments)
    }

    // xhr.addEventListener('error', function (err) {
    //   console.error('[xhrHook error]', err)
    // }, true)

    this.xhr = xhr

    return xhr
  }
}

const blockList = []

export function getBlockList () {
  return JSON.parse(JSON.stringify(blockList))
}

/**
 * 判断某个url地址是否需要被拦截掉
 * @param {URL} url -必选，要判断的URL地址
 */
export function isNeedBlock (url) {
  let needBlock = false

  if (!url) {
    return needBlock
  }

  for (let i = 0; i < blockList.length; i++) {
    const rule = blockList[i]
    if (typeof rule === 'string') {
      if (url.includes(rule)) {
        needBlock = true
        break
      }
    } else if (isRegExp(rule) && rule.test(url)) {
      needBlock = true
      break
    }
  }

  return needBlock
}

/**
 * 判断是否存在某条规则
 * @param {String|RegExp} rule
 * @returns {Boolean}
 */
export function hasRule (rule) {
  let hasRule = false
  for (let i = 0; i < blockList.length; i++) {
    if (rule === blockList[i]) {
      hasRule = true
      break
    }
  }
  return hasRule
}

/**
 * 增加拦截规则
 * @param {String|RegExp} rule
 * @returns
 */
export function add (rule) {
  if (!rule || hasRule(rule)) {
    return false
  } else {
    blockList.push(rule)
    return true
  }
}

// 对请求方法进行hook操作
// hook({
//   open: function (args, xhr) {
//     const url = args[1]
//     if (isNeedBlock(url)) {
//       return false
//     }
//   }
// })

fetchHook(function (args) {
  const url = args[0]

  // console.info('[fetchHook noBlock]', url)

  if (isNeedBlock(url)) {
    // console.info('[fetchHook block]', args)
    return false
  }
})

// xhrHook(function (config) {
//   const url = config.url
//   if (isNeedBlock(url)) {
//     console.error('[xhrHook block]', url)
//     return false
//   }
// })

// proxy({
//   onRequest: (config, handler) => {
//     if (!isNeedBlock(config.url)) {
//       handler.next(config)
//     } else {
//       console.error('[xhrHook block]', config)
//     }
//   }
// })
