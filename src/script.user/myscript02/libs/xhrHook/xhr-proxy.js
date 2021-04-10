/*
 * author: wendux
 * email: 824783146@qq.com
 * source code: https://github.com/wendux/Ajax-hook
 */

import { hook, unHook, configEvent } from './xhr-hook'

const events = ['load', 'loadend', 'timeout', 'error', 'readystatechange', 'abort']
const eventLoad = events[0]
const eventLoadEnd = events[1]
const eventTimeout = events[2]
const eventError = events[3]
const eventReadyStateChange = events[4]
const eventAbort = events[5]

let singleton
const prototype = 'prototype'

export function proxy (proxy) {
  if (singleton) throw 'Proxy already exists'
  return singleton = new Proxy(proxy)
}

export function unProxy () {
  singleton = null
  unHook()
}

function trim (str) {
  return str.replace(/^\s+|\s+$/g, '')
}

function getEventTarget (xhr) {
  return xhr.watcher || (xhr.watcher = document.createElement('a'))
}

function triggerListener (xhr, name) {
  const xhrProxy = xhr.getProxy()
  const callback = 'on' + name + '_'
  const event = configEvent({ type: name }, xhrProxy)
  xhrProxy[callback] && xhrProxy[callback](event)
  let evt
  if (typeof (Event) === 'function') {
    evt = new Event(name, { bubbles: false })
  } else {
    // https://stackoverflow.com/questions/27176983/dispatchevent-not-working-in-ie11
    evt = document.createEvent('Event')
    evt.initEvent(name, false, true)
  }
  getEventTarget(xhr).dispatchEvent(evt)
}

function Handler (xhr) {
  this.xhr = xhr
  this.xhrProxy = xhr.getProxy()
}

Handler[prototype] = Object.create({
  resolve: function resolve (response) {
    response = response || {}
    const xhrProxy = this.xhrProxy
    const xhr = this.xhr
    xhrProxy.readyState = 4
    xhr.resHeader = response.headers
    xhrProxy.response = xhrProxy.responseText = response.response
    xhrProxy.statusText = response.statusText
    xhrProxy.status = response.status
    triggerListener(xhr, eventReadyStateChange)
    triggerListener(xhr, eventLoad)
    triggerListener(xhr, eventLoadEnd)
  },
  reject: function reject (error) {
    this.xhrProxy.status = 0
    triggerListener(this.xhr, error.type)
    triggerListener(this.xhr, eventLoadEnd)
  }
})

function makeHandler (next) {
  function sub (xhr) {
    Handler.call(this, xhr)
  }

  sub[prototype] = Object.create(Handler[prototype])
  sub[prototype].next = next
  return sub
}

const RequestHandler = makeHandler(function (rq) {
  const xhr = this.xhr
  rq = rq || xhr.config
  xhr.withCredentials = rq.withCredentials
  xhr.open(rq.method, rq.url, rq.async !== false, rq.user, rq.password)
  for (const key in rq.headers) {
    xhr.setRequestHeader(key, rq.headers[key])
  }
  xhr.send(rq.body)
})

const ResponseHandler = makeHandler(function (response) {
  this.resolve(response)
})

const ErrorHandler = makeHandler(function (error) {
  this.reject(error)
})

function Proxy (proxy) {
  const onRequest = proxy.onRequest
  const onResponse = proxy.onResponse
  const onError = proxy.onError

  function handleResponse (xhr, xhrProxy) {
    const handler = new ResponseHandler(xhr)
    if (!onResponse) return handler.resolve()
    const ret = {
      response: xhrProxy.response,
      status: xhrProxy.status,
      statusText: xhrProxy.statusText,
      config: xhr.config,
      headers: xhr.resHeader || xhr.getAllResponseHeaders().split('\r\n').reduce(function (ob, str) {
        if (str === '') return ob
        const m = str.split(':')
        ob[m.shift()] = trim(m.join(':'))
        return ob
      }, {})
    }
    onResponse(ret, handler)
  }

  function onerror (xhr, xhrProxy, e) {
    const handler = new ErrorHandler(xhr)
    const error = { config: xhr.config, error: e }
    if (onError) {
      onError(error, handler)
    } else {
      handler.next(error)
    }
  }

  function preventXhrProxyCallback () {
    return true
  }

  function errorCallback (xhr, e) {
    onerror(xhr, this, e)
    return true
  }

  function stateChangeCallback (xhr, xhrProxy) {
    if (xhr.readyState === 4 && xhr.status !== 0) {
      handleResponse(xhr, xhrProxy)
    } else if (xhr.readyState !== 4) {
      triggerListener(xhr, eventReadyStateChange)
    }
    return true
  }

  return hook({
    onload: preventXhrProxyCallback,
    onloadend: preventXhrProxyCallback,
    onerror: errorCallback,
    ontimeout: errorCallback,
    onabort: errorCallback,
    onreadystatechange: function (xhr) {
      return stateChangeCallback(xhr, this)
    },
    open: function open (args, xhr) {
      const _this = this
      const config = xhr.config = { headers: {} }
      config.method = args[0]
      config.url = args[1]
      config.async = args[2]
      config.user = args[3]
      config.password = args[4]
      config.xhr = xhr
      const evName = 'on' + eventReadyStateChange
      if (!xhr[evName]) {
        xhr[evName] = function () {
          return stateChangeCallback(xhr, _this)
        }
      }

      const defaultErrorHandler = function defaultErrorHandler (e) {
        onerror(xhr, _this, configEvent(e, _this))
      };
      [eventError, eventTimeout, eventAbort].forEach(function (e) {
        const event = 'on' + e
        if (!xhr[event]) xhr[event] = defaultErrorHandler
      })

      // 如果有请求拦截器，则在调用onRequest后再打开链接。因为onRequest最佳调用时机是在send前，
      // 所以我们在send拦截函数中再手动调用open，因此返回true阻止xhr.open调用。
      //
      // 如果没有请求拦截器，则不用阻断xhr.open调用
      if (onRequest) return true
    },
    send: function (args, xhr) {
      const config = xhr.config
      config.withCredentials = xhr.withCredentials
      config.body = args[0]
      if (onRequest) {
        // In 'onRequest', we may call XHR's event handler, such as `xhr.onload`.
        // However, XHR's event handler may not be set until xhr.send is called in
        // the user's code, so we use `setTimeout` to avoid this situation
        const req = function () {
          onRequest(config, new RequestHandler(xhr))
        }
        config.async === false ? req() : setTimeout(req)
        return true
      }
    },
    setRequestHeader: function (args, xhr) {
      // Collect request headers
      xhr.config.headers[args[0].toLowerCase()] = args[1]
      return true
    },
    addEventListener: function (args, xhr) {
      const _this = this
      if (events.indexOf(args[0]) !== -1) {
        const handler = args[1]
        getEventTarget(xhr).addEventListener(args[0], function (e) {
          const event = configEvent(e, _this)
          event.type = args[0]
          event.isTrusted = true
          handler.call(_this, event)
        })
        return true
      }
    },
    getAllResponseHeaders: function (_, xhr) {
      const headers = xhr.resHeader
      if (headers) {
        let header = ''
        for (const key in headers) {
          header += key + ': ' + headers[key] + '\r\n'
        }
        return header
      }
    },
    getResponseHeader: function (args, xhr) {
      const headers = xhr.resHeader
      if (headers) {
        return headers[(args[0] || '').toLowerCase()]
      }
    }
  })
}
