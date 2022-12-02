import './comment'
import { listen, prefetch, prerender } from './quicklink.mjs'

const console = window.console
const quicklink = { listen, prefetch, prerender }

const ignoresRules = {
  urlPaths: 'api, logout, signout, exit, quit, login, logoff, subscribe, subscription, doubleclick, bit.ly, signin, signup, apk, release, amazon, google, shopping, checkout, shop, cart, ads, ticket, captcha',
  fileExtensions: '.zip, .pdf, .mp4, .webm, .mp3, .mov, .rar, .apk, .tar, .doc, .docx, .xls, .xlsx, .ppt, .pptx',
  urlProtocols: 'http:, tel:, mailto:, javascript:, market:'
}

/* 将上面的ignoresRules转换成数组 */
Object.keys(ignoresRules).forEach(key => {
  const valArr = ignoresRules[key].split(',')
  ignoresRules[key] = valArr.map(str => str.trim())
})

function ignoreFunc (uri, ele) {
  const result = ignoresRules.urlPaths.some(item => uri.includes(`/${item}/`)) ||
  ignoresRules.fileExtensions.some(item => uri.includes(item)) ||
  ignoresRules.urlProtocols.some(item => uri.startsWith(item))

  if (result) {
    console.log('[Quicklink][Ignore]', uri)
  } else {
    // console.info('[Quicklink][Prefetch]', uri)
  }

  return result
}

window.addEventListener('load', () => {
  quicklink.listen({ ignores: [ignoreFunc] })
})
