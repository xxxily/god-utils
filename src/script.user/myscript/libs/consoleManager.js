/*!
 * @name         consoleManager.js
 * @description  控制台管理器，解决console被屏蔽的问题
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/08/15 16:55
 * @github       https://github.com/xxxily
 */
import { getPageWindowSync } from '../../common/getPageWindow'

function registerConsoleManager (global) {
  try {
    global = global || getPageWindowSync()
    global.__rawConsole__ = global.__rawConsole__ || global.console

    function consoleMethodProxy (key) {
      global.__rawConsole__[`__raw${key}__`] = global.__rawConsole__[key]
      global.__rawConsole__[key] = new Proxy(global.__rawConsole__[key], {
        apply (target, ctx, args) {
          const rewriter = global.__rawConsole__.__rewriter__ || {}

          /* 执行重写函数 */
          if (rewriter[key] instanceof Function) {
            // rewriter[key].apply(ctx, args)
          }

          /* 禁止clear的调用 */
          if (key === 'clear') {
            return false
          }

          return Reflect.apply(target, ctx, args)
        }
      })
    }

    Object.keys(global.__rawConsole__).forEach(key => {
      if (global.__rawConsole__[key] instanceof Function) {
        consoleMethodProxy(key)
      }
    })

    global.console = new Proxy(global.__rawConsole__, {
      set (target, key, value) {
        if (value instanceof Function && key !== '__rewriter__') {
          global.__rawConsole__.warn('[consoleManager][detect the rewrite operation]', key, value)
          global.__rawConsole__.__rewriter__ = global.__rawConsole__.__rewriter__ || {}
          global.__rawConsole__.__rewriter__[key] = value

          /**
           * 禁止重写，必须返回true，否则在严格模式下会如下类型的错误：
           * Uncaught TypeError: 'set' on proxy: trap returned falsish for property 'xxx'
           */
          return true
        }

        // return Reflect.set(target, key, value)
      }
    })

    console.info('[consoleManager][register suc]', global.console)
  } catch (e) {
    console.error('[consoleManager]', e)
  }
}

export { registerConsoleManager }
