import { isRegExp } from '../../../libs/utils/typeof'
import { hook } from './xhrHook'

function fetchHook (callback) {
  if (window._realFetch) {
    return true
  }

  window._realFetch = window.fetch

  window.fetch = function () {
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
hook({
  open: function (args, xhr) {
    const url = args[1]
    if (isNeedBlock(url)) {
      return false
    }
  }
})

fetchHook(function (args) {
  const url = args[0]
  if (isNeedBlock(url)) {
    return false
  }
})
