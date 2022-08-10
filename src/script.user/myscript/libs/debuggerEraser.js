/*!
 * @name         debuggerEraser.js
 * @description  移除反调试的debugger字符串，让网站可正常启动调试工具
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/05/25 14:03
 * @github       https://github.com/xxxily
 */

/* eslint-disable no-eval */
window.__rawFunction__ = Function.prototype.constructor
window.__rawEval__ = window.eval

/**
 * 实现原理是对构建注入debugger匿名函数的文本进行检查，如果存在则对其进行移除
 * 相关文章：https://segmentfault.com/a/1190000012359015
 */
function registerDebuggerEraser () {
  window.__rawFunction__ = window.__rawFunction__ || Function.prototype.constructor
  window.__rawEval__ = window.__rawEval__ || window.eval

  function hasDebuggerFeature (code) {
    return typeof code === 'string' && code.indexOf('debugger') > -1
  }

  const proxyHandler = {
    apply (target, ctx, args) {
      const code = args[0]
      if (hasDebuggerFeature(code)) {
        // console.warn('存在疑似的反调试代码，已对该代码进行屏蔽：', code)
        args[0] = args[0].replace(/debugger/g, '')
      }

      return Reflect.apply(...arguments)
    }
  }

  const FunctionProxy = new Proxy(window.__rawFunction__, proxyHandler)
  window.Function = FunctionProxy
  window.Function.prototype.constructor = FunctionProxy

  const evalProxy = new Proxy(window.__rawEval__, proxyHandler)
  window.eval = evalProxy
}

function offDebuggerEraser () {
  if (window.__rawFunction__) {
    window.Function.prototype.constructor = window.__rawFunction__
    window.Function = window.__rawFunction__
  }
  if (window.__rawEval__) {
    window.eval = window.__rawEval__
  }
}

export { registerDebuggerEraser, offDebuggerEraser }
