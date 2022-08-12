/*!
 * @name         timerManager.js
 * @description  setInterval和setTimeout的时间管理器
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/08/12 10:35
 * @github       https://github.com/xxxily
 */

import { getPageWindowSync } from '../../common/getPageWindow'
window.__rawSetInterval__ = window.setInterval
window.__rawSetTimeout__ = window.setTimeout
window.__rawClearInterval__ = window.clearInterval
window.__rawClearTimeout__ = window.clearTimeout

function registerTimerManager (global, config) {
  global = global || window
  global.__rawSetInterval__ = global.__rawSetInterval__ || global.setInterval
  global.__rawSetTimeout__ = global.__rawSetTimeout__ || global.setTimeout
  global.__rawClearInterval__ = global.__rawClearInterval__ || global.clearInterval
  global.__rawClearTimeout__ = global.__rawClearTimeout__ || global.clearTimeout
  global.__timerState__ = global.__timerState__ || {}

  config = Object.assign({
    keepTimerState: false,
    blockAll: false,
    blockLongTask: false,
    rate: 1
  }, config || {})

  const timerProxyHandler = {
    apply (target, ctx, args) {
      const timerFunc = args[0]

      const timerState = {
        id: null,
        func: timerFunc,
        delay: args[1],
        execInfo: {
          count: 0,
          duration: [],
          /* 最近一次的执行时间 */
          lastTime: 0
        }
      }

      const timerFuncProxy = new Proxy(timerFunc, {
        apply (timerFuncTarget, timerFuncCtx, timerFuncArgs) {
          /* 判断是否需要停止运行 */
          const lastDuration = timerState.execInfo.duration[timerState.execInfo.duration.length - 1]
          if (lastDuration && lastDuration > 50 && config.blockLongTask) {
            !timerState.blocked && console.warn('[timerManager]该函数执行时间过长，已被终止运行', timerState)
            timerState.blocked = true
            return false
          } else if (config.blockAll === true) {
            !timerState.blocked && console.warn('[timerManager][blockAll]', timerState)
            timerState.blocked = true
            return false
          }

          timerState.execInfo.lastTime = Date.now()
          timerState.execInfo.count++

          const startTime = Date.now()
          const execResult = Reflect.apply(...arguments)

          /* 保存最近100次的执行时长统计 */
          const duration = Date.now() - startTime
          timerState.execInfo.duration.push(duration)
          if (timerState.execInfo.duration.length > 100) {
            timerState.execInfo.duration.shift()
          }

          /* 对执行时间过长的函数进行提示 */
          if (global._debugMode_ && duration > 50) {
            console.warn(`[timerManager]存在执行时间过长的Timer：${duration}ms`, timerState)
          }

          // console.info('[timerManager][exec]', timerState)

          return execResult
        }
      })

      /* 代理原来要执行的函数 */
      args[0] = timerFuncProxy
      /* 按配置的时间比率设定计时器间隔 */
      args[1] = config.rate * args[1]

      const timerId = Reflect.apply(...arguments)
      timerState.id = timerId
      global.__timerState__[timerId] = timerState

      // console.log('[timerManager][create]', timerState)

      return timerId
    }
  }

  const clearTimerProxyHandler = {
    apply (target, ctx, args) {
      const timerId = args[0]
      const timerState = global.__timerState__[timerId]
      if (timerState) {
        if (config.keepTimerState) {
          /* 只是标注已被清除，但并不真正删除定时间注册的相关信息，以便进行观察，注意这样会导致内存不断堆积 */
          timerState.hasClear = true
        } else {
          /* 移除timer的所有信息 */
          delete global.__timerState__[timerId]
        }
      }

      return Reflect.apply(...arguments)
    }
  }

  global.setInterval = new Proxy(global.__rawSetInterval__, timerProxyHandler)
  global.setTimeout = new Proxy(global.__rawSetTimeout__, timerProxyHandler)
  global.clearInterval = new Proxy(global.__rawClearInterval__, clearTimerProxyHandler)
  global.clearTimeout = new Proxy(global.__rawClearTimeout__, clearTimerProxyHandler)

  /* 尝试自动代理真实页面window对象下的相关方法属性 */
  try {
    const pageWin = getPageWindowSync()
    if (pageWin && global !== pageWin && !pageWin.__rawSetInterval__) {
      registerTimerManager(pageWin, config)
    }
  } catch (e) {
    console.error('[timerManager][registerTimerManager]', e)
  }
}

function offTimerManager (global) {
  global = global || window
  global.__rawSetInterval__ && (global.setInterval = global.__rawSetInterval__)
  global.__rawSetTimeout__ && (global.setTimeout = global.__rawSetTimeout__)
  global.__rawClearInterval__ && (global.clearInterval = global.__rawClearInterval__)
  global.__rawClearTimeout__ && (global.clearTimeout = global.__rawClearTimeout__)
  global.__timerState__ && (delete global.__timerState__)

  /* 尝试自动移除真实页面window对象下的相关方法属性的代理 */
  try {
    const pageWin = getPageWindowSync()
    if (pageWin && global !== pageWin && pageWin.__rawSetInterval__) {
      offTimerManager(pageWin)
    }
  } catch (e) {
    console.error('[timerManager][offTimerManager]', e)
  }
}

export { registerTimerManager, offTimerManager }
