/*
 * author: wendux
 * email: 824783146@qq.com
 * source code: https://github.com/wendux/Ajax-hook
 */

// Save original XMLHttpRequest as _rxhr
const realXhr = '_rxhr'

export function configEvent (event, xhrProxy) {
  const e = {}
  for (const attr in event) e[attr] = event[attr]
  // xhrProxy instead
  e.target = e.currentTarget = xhrProxy
  return e
}

export function hook (proxy) {
  // Avoid double hookAjax
  window[realXhr] = window[realXhr] || XMLHttpRequest

  XMLHttpRequest = function () {
    const xhr = new window[realXhr]()
    // We shouldn't hookAjax XMLHttpRequest.prototype because we can't
    // guarantee that all attributes are on the prototype。
    // Instead, hooking XMLHttpRequest instance can avoid this problem.
    for (const attr in xhr) {
      let type = ''
      try {
        type = typeof xhr[attr] // May cause exception on some browser
      } catch (e) {
      }
      if (type === 'function') {
        // hookAjax methods of xhr, such as `open`、`send` ...
        this[attr] = hookFunction(attr)
      } else {
        Object.defineProperty(this, attr, {
          get: getterFactory(attr),
          set: setterFactory(attr),
          enumerable: true
        })
      }
    }
    const that = this
    xhr.getProxy = function () {
      return that
    }
    this.xhr = xhr
  }

  // Generate getter for attributes of xhr
  function getterFactory (attr) {
    return function () {
      const v = this.hasOwnProperty(attr + '_') ? this[attr + '_'] : this.xhr[attr]
      const attrGetterHook = (proxy[attr] || {}).getter
      return attrGetterHook && attrGetterHook(v, this) || v
    }
  }

  // Generate setter for attributes of xhr; by this we have an opportunity
  // to hookAjax event callbacks （eg: `onload`） of xhr;
  function setterFactory (attr) {
    return function (v) {
      const xhr = this.xhr
      const that = this
      const hook = proxy[attr]
      // hookAjax  event callbacks such as `onload`、`onreadystatechange`...
      if (attr.substring(0, 2) === 'on') {
        that[attr + '_'] = v
        xhr[attr] = function (e) {
          e = configEvent(e, that)
          const ret = proxy[attr] && proxy[attr].call(that, xhr, e)
          ret || v.call(that, e)
        }
      } else {
        // If the attribute isn't writable, generate proxy attribute
        const attrSetterHook = (hook || {}).setter
        v = attrSetterHook && attrSetterHook(v, that) || v
        this[attr + '_'] = v
        try {
          // Not all attributes of xhr are writable(setter may undefined).
          xhr[attr] = v
        } catch (e) {
        }
      }
    }
  }

  // Hook methods of xhr.
  function hookFunction (fun) {
    return function () {
      const args = [].slice.call(arguments)
      if (proxy[fun]) {
        const ret = proxy[fun].call(this, args, this.xhr)
        // If the proxy return value exists, return it directly,
        // otherwise call the function of xhr.
        if (ret) return ret
      }
      return this.xhr[fun].apply(this.xhr, args)
    }
  }

  // Return the real XMLHttpRequest
  return window[realXhr]
}

export function unHook () {
  if (window[realXhr]) XMLHttpRequest = window[realXhr]
  window[realXhr] = undefined
}
