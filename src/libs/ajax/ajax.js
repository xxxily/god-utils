/*!
 * @name         ajax.js
 * @description  简单的ajax请求方法，支持现代浏览器
 * @version      0.0.1
 * @author       Blaze
 * @date         26/03/2019 11:22
 * @github       https://github.com/xxxily
 */

function isObj (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function eachKey (obj, callback) {
  callback = callback || function () {}
  for (let key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      callback(key, obj[key])
    }
  }
}

/**
 * 基于XMLHttpRequest的ajax方法
 * 相关参考文档：
 * https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
 * https://www.jianshu.com/p/b5e62ec9bd92
 * https://plainjs.com/javascript/ajax/send-ajax-get-and-post-requests-47/
 * https://github.com/fdaciuk/ajax/blob/dev/src/ajax.js
 */

function ajax (setting) {
  let config = {
    method: 'get',
    url: '',
    data: null,
    async: true,
    beforeSend: function (xhr, config) {},
    success: function () {},
    error: function () {}
  }

  isObj(setting) && eachKey(setting, function (key, val) {
    config[key] = val
  })

  let params = []
  if (isObj(config.data)) {
    eachKey(config.data, function (key, val) {
      params.push(encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(val)))
    })
    params = params.join('&')
  }

  let xhr = new window.XMLHttpRequest()
  let method = config.method.toUpperCase()
  let url = config.url

  xhr.onreadystatechange = function () {
    if (xhr.readyState > 3) {
      if (xhr.status >= 200 && xhr.status < 300) {
        config.success && config.success(xhr.responseText, xhr)
      } else {
        config.error && config.error(xhr.responseText, xhr)
      }
    }
  }

  xhr.open(method, url, config.async)
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
  if (method === 'POST') {
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  }

  config.beforeSend && config.beforeSend(xhr, config)
  xhr.send(params)
  return xhr
}
export default ajax
