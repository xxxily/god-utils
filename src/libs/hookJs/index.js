/*!
 * @name         index.js
 * @description  hookJs JS AOP切面编程辅助库
 * @version      0.0.1
 * @author       Blaze
 * @date         2020/10/22 17:40
 * @github       https://github.com/xxxily
 */

const util = {
  toStr: (obj) => Object.prototype.toString.call(obj),
  isObj: obj => Object.prototype.toString.call(obj) === '[object Object]',
  /* 判断是否为引用类型，用于更宽泛的场景 */
  isRef: obj => typeof obj === 'object',
  isReg: obj => Object.prototype.toString.call(obj) === '[object RegExp]',
  isFn: obj => obj instanceof Function,
  isAsyncFn: fn => Object.prototype.toString.call(fn) === '[object AsyncFunction]',
  isPromise: obj => Object.prototype.toString.call(obj) === '[object Promise]',
  firstUpperCase: str => str.replace(/^\S/, s => s.toUpperCase()),
  debug: {
    log () {
      let log = window.console.log
      /* 如果log也被hook了，则使用未被hook前的log函数 */
      if (log.originMethod) { log = log.originMethod }
      if (window._debugMode_) {
        log.apply(window.console, arguments)
      }
    }
  }
}

const hookJs = {
  _addHook (hookMethod, fn, type) {
    const hookKeyName = type + 'Hooks'
    if (!hookMethod[hookKeyName]) {
      hookMethod[hookKeyName] = []
    }

    /* 注册（储存）要被调用的hook函数，同时防止重复注册 */
    let hasSameHook = false
    for (let i = 0; i < hookMethod[hookKeyName].length; i++) {
      if (fn === hookMethod[hookKeyName][i]) {
        hasSameHook = true
        break
      }
    }

    if (!hasSameHook) {
      hookMethod[hookKeyName].push(fn)
    }
  },
  _hookMethodcGenerator (parentObj, methodName, originMethod, context) {
    context = context || parentObj
    const hookMethod = function () {
      let execResult = null
      const execArgs = arguments
      const errorHooks = hookMethod.errorHooks || []
      const hangUpHooks = hookMethod.hangUpHooks || []
      const replaceHooks = hookMethod.replaceHooks || []

      function runHooks (hooks, info) {
        if (Array.isArray(hooks)) {
          hooks.forEach(fn => {
            if (util.isFn(fn)) {
              fn(execArgs, parentObj, methodName, originMethod, info, context)
            }
          })
        }
      }

      runHooks(hookMethod.beforeHooks)

      if (hangUpHooks.length || replaceHooks.length) {
        /**
         * 当存在hangUpHooks或replaceHooks的时候是不会触发原来函数的
         * 本质上来说hangUpHooks和replaceHooks是一样的，只是外部的定义描述不一致和分类不一致而已
         */
        runHooks(hookMethod.hangUpHooks)
        runHooks(hookMethod.replaceHooks)
      } else {
        if (errorHooks.length) {
          try {
            execResult = originMethod.apply(context, arguments)
          } catch (e) {
            runHooks(errorHooks, e)
            throw e
          }
        } else {
          execResult = originMethod.apply(context, arguments)
        }
      }

      /* 执行afterHooks，但如果返回的是Promise则需进一步细分处理 */
      if (util.isPromise(execResult)) {
        execResult.then(() => {
          runHooks(hookMethod.afterHooks)
          return Promise.resolve.apply(Promise, arguments)
        }).catch(err => {
          runHooks(errorHooks, err)
          return Promise.reject(err)
        })
      } else {
        runHooks(hookMethod.afterHooks)
      }

      return execResult
    }

    hookMethod.originMethod = originMethod
    originMethod.hookMethod = hookMethod
    hookMethod.isHook = true

    util.debug.log(`[hook method] ${util.toStr(parentObj)} ${methodName}`)

    return hookMethod
  },
  /* 使用代理进行hook比直接运行originMethod.apply的错误率更低，但性能也会稍差些 */
  _proxyMethodcGenerator (parentObj, methodName, originMethod, context, noProxy, proxyHandler) {
    const t = this
    let hookMethod = null

    /* 存在缓存则使用缓存的hookMethod */
    if (t.isHook(originMethod)) {
      hookMethod = originMethod
    } else if (t.isHook(originMethod.hookMethod)) {
      hookMethod = originMethod.hookMethod
    }

    if (hookMethod) {
      if (!hookMethod.isHook) {
        /* 重新标注被hook状态 */
        hookMethod.isHook = true
        util.debug.log(`[hook method] ${util.toStr(parentObj)} ${methodName}`)
      }
      return hookMethod
    }

    /* 不存在代理对象或为了提高性能指定不使用代理方式进行hook时，则使用_hookMethodcGenerator进行hook */
    if (!window.Proxy || noProxy) {
      return this._hookMethodcGenerator.apply(this, arguments)
    }

    /* 注意：使用Proxy代理，hookMethod和originMethod将共用同一对象 */
    hookMethod = new Proxy(originMethod, {
      apply (target, ctx, args) {
        ctx = context || ctx
        let execResult = null
        const execArgs = args
        const errorHooks = hookMethod.errorHooks || []
        const hangUpHooks = hookMethod.hangUpHooks || []
        const replaceHooks = hookMethod.replaceHooks || []

        function runHooks (hooks, info) {
          if (Array.isArray(hooks)) {
            hooks.forEach(fn => {
              if (util.isFn(fn)) {
                fn(execArgs, parentObj, methodName, originMethod, info, ctx)
              }
            })
          }
        }

        runHooks(hookMethod.beforeHooks)

        if (hangUpHooks.length || replaceHooks.length) {
          /**
           * 当存在hangUpHooks或replaceHooks的时候是不会触发原来函数的
           * 本质上来说hangUpHooks和replaceHooks是一样的，只是外部的定义描述不一致和分类不一致而已
           */
          runHooks(hookMethod.hangUpHooks)
          runHooks(hookMethod.replaceHooks)
        } else {
          if (errorHooks.length) {
            try {
              execResult = target.apply(ctx, args)
            } catch (e) {
              runHooks(errorHooks, e)
              throw e
            }
          } else {
            execResult = target.apply(ctx, args)
          }
        }

        /* 执行afterHooks，但如果返回的是Promise则需进一步细分处理 */
        if (util.isPromise(execResult)) {
          execResult.then(() => {
            runHooks(hookMethod.afterHooks)
            return Promise.resolve.apply(Promise, arguments)
          }).catch(err => {
            runHooks(errorHooks, err)
            return Promise.reject(err)
          })
        } else {
          runHooks(hookMethod.afterHooks)
        }

        return execResult
      },
      ...proxyHandler
    })

    hookMethod.originMethod = originMethod
    originMethod.hookMethod = hookMethod
    hookMethod.isHook = true

    util.debug.log(`[hook method] ${util.toStr(parentObj)} ${methodName}`)

    return hookMethod
  },
  _getObjKeysByRule (obj, rule) {
    let excludeRule = null
    let result = rule

    if (util.isObj(rule) && rule.include) {
      excludeRule = rule.exclude
      rule = rule.include
      result = rule
    }

    /* 获取包含自身、继承、可枚举、不可枚举的键名 */
    let allKeys = []
    function getAllKeys () {
      if (allKeys.length) { return allKeys }
      const tmpArr = []
      for (const key in obj) { tmpArr.push(key) }
      allKeys = Array.from(new Set(tmpArr.concat(Reflect.ownKeys(obj))))
      return allKeys
    }

    /**
     * for in、Object.keys与Reflect.ownKeys的区别见：
     * https://es6.ruanyifeng.com/#docs/object#%E5%B1%9E%E6%80%A7%E7%9A%84%E9%81%8D%E5%8E%86
     */
    if (rule === '*') {
      result = Object.keys(obj)
    } else if (rule === '**') {
      result = Reflect.ownKeys(obj)
    } else if (rule === '***') {
      result = getAllKeys()
    } else if (util.isReg(rule)) {
      result = getAllKeys().filter(keyName => rule.test(keyName))
    }

    /* 如果存在排除规则，则需要进行排除 */
    if (excludeRule) {
      result = Array.isArray(result) ? result : [result]
      if (util.isReg(excludeRule)) {
        result = result.filter(keyName => !excludeRule.test(keyName))
      } else if (Array.isArray(excludeRule)) {
        result = result.filter(keyName => !excludeRule.includes(keyName))
      } else {
        result = result.filter(keyName => excludeRule !== keyName)
      }
    }

    return result
  },
  /**
   * 判断某个函数是否已经被hook
   * @param fn {Function} -必选 要判断的函数
   * @returns {boolean}
   */
  isHook (fn) {
    return fn && util.isFn(fn.originMethod) && fn !== fn.originMethod
  },
  /**
   * hook 核心函数
   * @param parentObj {Object} -必选 被hook函数依赖的父对象
   * @param hookMethods {Object|Array|RegExp|string} -必选 被hook函数的函数名或函数名的匹配规则
   * @param fn {Function} -必选 hook之后的回调方法
   * @param type {String} -可选 默认before，指定运行hook函数回调的时机，可选字符串：before、after、replace、error、hangUp
   * @param context {Object} -可选 指定运行被hook函数时的上下文对象
   * @param proxyHandler {Object} -可选 默认使用的是Proxy的apply handler进行hook，如果你有特殊需求也可以配置自己的handler以实现更复杂的功能
   * @param noProxy {Boolean} -可选 默认false，不使用Proxy进行hook，以获得更高性能，但也意味着通用性更差些，对于要hook HTMLElement.prototype、EventTarget.prototype这些对象里面的非实例的函数往往会失败而导致被hook函数执行出错
   * @returns {boolean}
   */
  hook (parentObj, hookMethods, fn, type, context, proxyHandler, noProxy) {
    type = type || 'before'

    if (!util.isRef(parentObj) || !util.isFn(fn) || !hookMethods) {
      return false
    }

    const t = this

    hookMethods = t._getObjKeysByRule(parentObj, hookMethods)
    hookMethods = Array.isArray(hookMethods) ? hookMethods : [hookMethods]

    hookMethods.forEach(methodName => {
      /* 原型链上的methodName能遍历出来，但进行读写则会出错，所以需要通过try catch进行预判 */
      try {
        if (!parentObj[methodName]) return false
      } catch (e) {
        return false
      }

      const originMethod = parentObj[methodName]
      let hookMethod = null

      /* 非函数无法进行hook操作 */
      if (!util.isFn(originMethod)) {
        return false
      }

      hookMethod = t._proxyMethodcGenerator(parentObj, methodName, originMethod, context, proxyHandler, noProxy)

      /* 使用hookMethod接管需要被hook的方法 */
      if (parentObj[methodName] !== hookMethod) {
        parentObj[methodName] = hookMethod
      }

      t._addHook(hookMethod, fn, type)
    })
  },
  /**
   * 取消对某个函数的hook
   * @param parentObj {Object} -必选 要取消被hook函数依赖的父对象
   * @param hookMethods {Object|Array|RegExp|string} -必选 要取消被hook函数的函数名或函数名的匹配规则
   * @param type {String} -可选 默认before，指定要取消的hook类型，可选字符串：before、after、replace、error、hangUp，如果不指定该选项则取消所有类型下的所有回调
   * @param fn {Function} -必选 取消指定的hook回调函数，如果不指定该选项则取消对应type类型下的所有回调
   * @returns {boolean}
   */
  unHook (parentObj, hookMethods, type, fn) {
    if (!util.isRef(parentObj) || !hookMethods) {
      return false
    }

    const t = this
    hookMethods = t._getObjKeysByRule(parentObj, hookMethods)
    hookMethods = Array.isArray(hookMethods) ? hookMethods : [hookMethods]

    hookMethods.forEach(methodName => {
      try {
        if (!parentObj[methodName] || !parentObj[methodName].originMethod) return false
      } catch (e) {
        return false
      }

      const hookMethod = parentObj[methodName]
      const originMethod = hookMethod.originMethod

      if (!t.isHook(hookMethod)) {
        return false
      }

      if (type) {
        const hookKeyName = type + 'Hooks'
        const hooks = hookMethod[hookKeyName] || []

        if (fn) {
          /* 删除指定类型下的指定hook函数 */
          for (let i = 0; i < hooks.length; i++) {
            if (fn === hooks[i]) {
              hookMethod[hookKeyName].splice(i, 1)
              util.debug.log(`[unHook ${hookKeyName} func] ${util.toStr(parentObj)} ${methodName}`, fn)
              break
            }
          }
        } else {
          /* 删除指定类型下的所有hook函数 */
          if (Array.isArray(hookMethod[hookKeyName])) {
            hookMethod[hookKeyName] = []
            util.debug.log(`[unHook all ${hookKeyName}] ${util.toStr(parentObj)} ${methodName}`)
          }
        }
      } else {
        /* 彻底还原被hook的函数 */
        if (util.isFn(originMethod)) {
          Object.keys(hookMethod).forEach(keyName => {
            if (/Hooks$/.test(keyName) && Array.isArray(hookMethod[keyName])) {
              hookMethod[keyName] = []
            }
          })

          hookMethod.isHook = false
          parentObj[methodName] = originMethod
          util.debug.log(`[unHook method] ${util.toStr(parentObj)} ${methodName}`)
        }
      }
    })
  },
  /* 源函数运行前的hook */
  before (obj, hookMethods, fn, context) {
    return this.hook(obj, hookMethods, fn, 'before', context)
  },
  /* 源函数运行后的hook */
  after (obj, hookMethods, fn, context) {
    return this.hook(obj, hookMethods, fn, 'after', context)
  },
  /* 替换掉要hook的函数，不再运行源函数，换成运行其他逻辑 */
  replace (obj, hookMethods, fn, context) {
    return this.hook(obj, hookMethods, fn, 'replace', context)
  },
  /* 源函数运行出错时的hook */
  error (obj, hookMethods, fn, context) {
    return this.hook(obj, hookMethods, fn, 'error', context)
  },
  /* 底层实现逻辑与replace一样，都是替换掉要hook的函数，不再运行源函数，只不过是为了明确语义，将源函数挂起不再执行，原则上也不再执行其他逻辑，如果要执行其他逻辑请使用replace hook */
  hangUp (obj, hookMethods, fn, context) {
    return this.hook(obj, hookMethods, fn, 'hangUp', context)
  }
}

export default hookJs
