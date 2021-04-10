// ==UserScript==
// @name         ajaxHook
// @namespace    https://ajaxHook.com
// @version      0.0.1
// @license      LGPLv3
// @description  ajaxHook demo
// @author       Blaze
// @match        *://*/*
// @match        http://*/*
// @match        https://*/*
// @grant        unsafeWindow
// @license      GPL
// @run-at       document-start
// @require      https://unpkg.com/ajax-hook/dist/ajaxhook.min.js
// ==/UserScript==

// https://unpkg.com/ajax-hook@2.0.3/dist/ajaxhook.min.js
// https://unpkg.com/ajax-hook/dist/ajaxhook.min.js

function hookInit (ob) {
  const win = ob || window
  const realXhr = 'RealXMLHttpRequest'
  ob.hookAjax = function (proxy) {
    win[realXhr] = win[realXhr] || XMLHttpRequest

    win.XMLHttpRequest = function () {
      const xhr = new window[realXhr]()

      for (const attr in xhr) {
        let type = ''
        try {
          type = typeof xhr[attr]
        } catch (e) {
        }
        if (type === 'function') {
          this[attr] = hookFunction(attr)
        } else {
          Object.defineProperty(this, attr, {
            get: getterFactory(attr),
            set: setterFactory(attr),
            enumerable: true
          })
        }
      }
      this.xhr = xhr
    }

    // Generate getter for attributes of xhr
    function getterFactory (attr) {
      return function () {
        // eslint-disable-next-line no-prototype-builtins
        const v = this.hasOwnProperty(attr + '_') ? this[attr + '_'] : this.xhr[attr]
        const attrGetterHook = (proxy[attr] || {}).getter
        return (attrGetterHook && attrGetterHook(v, this)) || v
      }
    }

    function setterFactory (attr) {
      return function (v) {
        const xhr = this.xhr
        const that = this
        const hook = proxy[attr]
        if (typeof hook === 'function') {
          xhr[attr] = function () {
            proxy[attr](that) || v.apply(xhr, arguments)
          }
        } else {
          // If the attribute isn't writable, generate proxy attribute
          const attrSetterHook = (hook || {}).setter
          v = (attrSetterHook && attrSetterHook(v, that)) || v
          try {
            xhr[attr] = v
          } catch (e) {
            this[attr + '_'] = v
          }
        }
      }
    }

    // Hook methods of xhr.
    function hookFunction (fun) {
      return function () {
        const args = [].slice.call(arguments)
        if (proxy[fun] && proxy[fun].call(this, args, this.xhr)) {
          return
        }
        return this.xhr[fun].apply(this.xhr, args)
      }
    }

    return window[realXhr]
  }

  // Cancel hook
  ob.unHookAjax = function () {
    if (win[realXhr]) win.XMLHttpRequest = win[realXhr]
    win[realXhr] = undefined
  }

  ob.default = ob
}

/**
 * 通过同步的方式获取pageWindow
 * 注意同步获取的方式需要将脚本写入head，部分网站由于安全策略会导致写入失败，而无法正常获取
 * @returns {*}
 */
function getPageWindowSync () {
  if (document._win_) return document._win_

  const head = document.head || document.querySelector('head')
  const script = document.createElement('script')
  script.appendChild(document.createTextNode('document._win_ = window'))
  head.appendChild(script)

  return document._win_
}

const win = getPageWindowSync()
hookInit(win)

win.hookAjax({
  onreadystatechange: function (xhr) {

  },
  onload: function (xhr) {

  },
  open: function (arg) {
    const url = arg[1]
    console.log(url)
  }
})
