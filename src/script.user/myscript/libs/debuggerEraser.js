/*!
 * @name         debuggerEraser.js
 * @description  移除反调试的debugger字符串，让网站可正常启动调试工具
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/08/10 14:03
 * @github       https://github.com/xxxily
 */
import { getPageWindowSync } from '../../common/getPageWindow'

/* eslint-disable no-eval */
window.__rawFunction__ = Function.prototype.constructor
window.__rawEval__ = window.eval

/**
 * 实现原理是对构建注入debugger匿名函数的文本进行检查，如果存在则对其进行移除
 * 相关文章：
 * [突破前端反调试--阻止页面不断debugger](https://segmentfault.com/a/1190000012359015)
 * [js检测开发者工具Devtools是否打开防调试](https://www.jianshu.com/p/82c70259364b)
 */
function registerDebuggerEraser (global, globalConfig = {}) {
  global = global || window
  global.__rawFunction__ = global.__rawFunction__ || Function.prototype.constructor
  global.__rawEval__ = global.__rawEval__ || global.eval

  function hasDebuggerFeature (code) {
    return typeof code === 'string' && code.indexOf('debugger') > -1
  }

  const proxyHandler = {
    apply (target, ctx, args) {
      const code = args[0]
      if (hasDebuggerFeature(code)) {
        // console.warn('存在疑似的反调试代码，已对该代码进行屏蔽：', code)
        // args[0] = args[0].replace(/debugger/g, '')

        /* 抛出异常可以终止后续的代码执行，如果是循环检测，则可以终止掉循环 */
        args[0] = args[0].replace(/debugger/g, ';throw new Error();')
      }

      /* 保存运行的字符串代码记录，以便查看都运行了哪些字符串代码 */
      if (global._debugMode_) {
        global.__eval_code_list__ = global.__eval_code_list__ || []
        if (global.__eval_code_list__.length < 500) {
          if (code && code.length > 3 && code.indexOf('debugger') === -1) {
            global.__eval_code_list__.push(code)
          }
        }

        /* 达到一定量时主动输出到控制台，以便查看 */
        if (global.__eval_code_list__.length === 100) {
          setTimeout(() => {
            console.warn(`[debuggerEraser][__eval_code_list__]${global.location.href}`, global.__eval_code_list__)
          }, 1500)
        }
      }

      /* getPageWindowSync标识 */
      if (code.indexOf('getPageWindowSync=1') > -1) {
        return Reflect.apply(...arguments)
      }

      let evalResult = null

      try {
        evalResult = Reflect.apply(...arguments)
      } catch (e) {
        global.__debuggerEraserErrorCount__ = global.__debuggerEraserErrorCount__ || 1
        global.__debuggerEraserErrorCount__++

        if (global.__debuggerEraserErrorCount__ > 50) {
          global.__debuggerEraserErrorCount__ === 51 && console.error(`[debuggerEraser][${target.name}][error]`, '异常次数过多，不再输出相关错误', e)
        } else {
          if (target.name === 'eval') {
            console.error(`[debuggerEraser][${target.name}][error]`, '\n代理后eval只能获取到全局作用域，而要执行的代码字符串里却包含了局部作用域的变量，如果抛出了这个异常，基本都是这个原因。 \n参见：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/eval \n', ...arguments, code, e)
          } else {
            console.error(`[debuggerEraser][${target.name}][error]`, ...arguments, code, e)
          }
        }
      }

      if (evalResult instanceof global.__rawFunction__) {
        evalResult = new Proxy(evalResult, {
          apply (target, ctx, args) {
            // TODO 对返回结果进行干预
            const evalExecResult = Reflect.apply(...arguments)

            /* 判断是否正在尝试通过eval、Function获取全新的window对象 */
            if (evalExecResult && evalExecResult.document && evalExecResult.setInterval) {
              // TODO 对返回的window对象进行干预
            }

            return evalExecResult
          }
        })
      }

      return evalResult
    }
  }

  const FunctionProxy = new Proxy(global.__rawFunction__, proxyHandler)
  global.Function = FunctionProxy
  global.Function.prototype.constructor = FunctionProxy

  /**
   * 直接调用eval能获取到局部作用域中的变量，而通过代理后的eval将变成间接调用，此时只能获取全局作用域中的变量
   * 这个特性导致了对eval进行代理，容易出现执行异常，导致网页运行异常
   * 具体说明参见下述文档：
   * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/eval
   */
  const evalProxy = new Proxy(global.__rawEval__, proxyHandler)
  global.eval = evalProxy

  /* 尝试自动代理真实页面window对象下的相关方法属性 */
  try {
    const pageWin = getPageWindowSync(window.__rawFunction__)
    if (pageWin && global !== pageWin && !pageWin.__rawFunction__) {
      registerDebuggerEraser(pageWin)
    }
  } catch (e) {
    console.error('[debuggerEraser][registerDebuggerEraser]', e)
  }
}

function offDebuggerEraser (global) {
  global = global || window
  if (global.__rawFunction__) {
    global.Function.prototype.constructor = global.__rawFunction__
    global.Function = global.__rawFunction__
  }
  if (global.__rawEval__) {
    global.eval = global.__rawEval__
  }

  /* 尝试自动移除真实页面window对象下的相关方法属性的代理 */
  try {
    const pageWin = getPageWindowSync(window.__rawFunction__)
    if (pageWin && global !== pageWin && pageWin.__rawFunction__) {
      offDebuggerEraser(pageWin)
    }
  } catch (e) {
    console.error('[debuggerEraser][offDebuggerEraser]', e)
  }
}

/* 检测打开Devtools然后注入debugger的代码实例 */
// setInterval(function () {
//   check()
// }, 4000)
// var check = function () {
//   function doCheck (a) {
//     if (('' + a / a).length !== 1 || a % 20 === 0) {
//       (function () {}.constructor('debugger')())
//     } else {
//       (function () {}.constructor('debugger')())
//     }
//     doCheck(++a)
//   }
//   try {
//     doCheck(0)
//   } catch (err) {}
// }
// check()

/**
 * 可生产调试保护代码的在线工具
 * https://www.json.cn/json/jshx.html
 * https://www.jsjiami.com/
 *
 * 存在反调试代码实例的相关网址
 * http://www.sc.10086.cn/service/login.html
 * https://photokit.com/editor/?lang=zh
 */

export { registerDebuggerEraser, offDebuggerEraser }
