/*!
 * @name         index.js
 * @description  编写测试用例时常用的一些公共方法
 * @version      0.0.1
 * @author       Blaze
 * @date         2020/11/16 15:37
 * @github       https://github.com/xxxily
 */

const $ = Cypress.$
const $dom = selecter => $(document.querySelectorAll(selecter))
const toStr = Function.prototype.call.bind(Object.prototype.toString)
const isObj = obj => toStr(obj) === '[object Object]'
const isFn = obj => obj instanceof Function

function getAllKeys (obj) {
  const tmpArr = []
  for (const key in obj) { tmpArr.push(key) }
  const allKeys = Array.from(new Set(tmpArr.concat(Reflect.ownKeys(obj))))
  return allKeys
}

export {
  $,
  $dom,
  toStr,
  isObj,
  isFn,
  getAllKeys
}
