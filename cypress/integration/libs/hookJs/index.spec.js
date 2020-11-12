import hookJs from '../../../../src/libs/hookJs/index'
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

describe('hookJs单测', () => {
  before(() => {
    console.log('-------- Before Test --------')
  })
  beforeEach(() => {
    window._debugMode_ = true
    $dom('body').html('')
  })
  afterEach(() => {
    $dom('body').html('')
    cy.clearCookies()
  })

  it('基本调用', () => {
    let hookSuc = false

    hookJs.hook(console, 'info', () => {
      hookSuc = true
    })
    console.info('hook test')
    hookJs.unHook(console, 'info')

    expect(hookSuc).to.equal(true)
  })

  it('数组传参支持', () => {
    const hookRule = ['setInterval', 'setTimeout', 'clearInterval', 'clearTimeout']

    hookJs.hook(window, hookRule, () => {})
    hookRule.forEach(methodName => {
      expect(window[methodName]).has.property('originMethod') &&
      expect(window[methodName]).to.not.eql(window[methodName].originMethod)
    })

    hookJs.unHook(window, hookRule)
  })

  it('正则传参支持', () => {
    const hookRule = /^get/

    hookJs.hook(Object, hookRule, () => {})

    Reflect.ownKeys(Object).forEach(methodName => {
      if (hookRule.test(methodName) && isFn(Object[methodName])) {
        expect(Object[methodName]).to.not.eql(Object[methodName].originMethod)
      }
    })

    hookJs.unHook(window.Object, hookRule)
  })

  it('排除规则传参支持', () => {
    const hookRule = {
      include: '***',
      exclude: ['setAttribute', 'getAttribute', 'hasAttribute', 'removeAttribute', 'createElement', 'createTextNode', 'querySelectorAll', 'querySelector', 'getElementsByTagName', 'getElementsByName', 'getElementById', 'getElementsByClassName', 'getBoundingClientRect', 'addEventListener', '_addEventListener', 'hasChildNodes', 'appendChild', 'getItem', 'requestAnimationFrame', 'setTimeout', 'setInterval', 'clearInterval', 'clearTimeout', 'cancelAnimationFrame', 'constructor', 'prototype', 'Boolean', 'Object', 'String', 'Number']
    }

    const hookCallback = function (execArgs, parentObj, methodName, originMethod, info, ctx) {
      console.log(`${toStr(parentObj)} [${methodName}] `)
    }

    // hookJs.hook(window, hookRule, hookCallback)
    hookJs.hook(window.document, hookRule, hookCallback)
    hookJs.hook(window.HTMLElement.prototype, hookRule, hookCallback)

    const objs = [window.document, window.HTMLElement.prototype]
    objs.forEach(parentObj => {
      getAllKeys(parentObj).forEach(methodName => {
        /* 某些属性在原型链上是没访问权限，所以需要预判，防止出错 */
        try {
          if (!parentObj[methodName]) { return true }
        } catch (e) {
          console.log('没访问权限的属性：', methodName)
          return true
        }

        if (hookRule.exclude.includes(methodName)) {
          expect(parentObj[methodName]).not.property('originMethod')
        } else if (parentObj[methodName] instanceof Function) {
          expect(parentObj[methodName].originMethod).to.be.a('function')
        }
      })
    })

    hookJs.unHook(window, hookRule)
    hookJs.unHook(window.document, hookRule)
    hookJs.unHook(window.HTMLElement.prototype, hookRule)
  })

  it('修改运行参数', () => {
    hookJs.hook(Math, 'min', (args) => {
      args[1] = 0.0001
    })
    expect(Math.min(2, 1)).to.equal(0.0001)
    hookJs.unHook(Math, 'min')
  })

  it('修改运行结果', () => {
    /* 在after hook里通过修改execInfo下的result来改变运行结果 */
    hookJs.hook(Math, 'min', (args, parentObj, methodName, originMethod, execInfo, ctx) => {
      execInfo.result = 10000
    }, 'after')
    expect(Math.min(2, 1)).to.equal(10000)
    hookJs.unHook(Math, 'min')
  })

  it('非代理模式的hook', () => {
    ['before', 'after', 'replace', 'error', 'hangUp'].forEach(type => {
      hookJs.hook(console, 'info', (args) => {
        console.log('noProxy hook')
      }, type, false, null, {}, true)
    })

    expect(console.info).not.throw()
    expect(console.info).to.property('originMethod')

    hookJs.unHook(console, 'info')
  })

  it('对writable为false的函数进行hook', () => {
    const obj = Object.defineProperty({}, 'hookTest', {
      value: function () {},
      writable: false,
      /* configurable 必须定义为true，否则默认为false，则无法进行hook */
      configurable: true
    })

    let result = false

    hookJs.hook(obj, 'hookTest', () => {
      result = true
    })

    expect(result).to.equal(false)
    obj.hookTest()
    expect(result).to.equal(true)
  })

  it('hook整个window对象', () => {
    let hookSuc = 0

    hookJs.hook(window, '**', (args, parentObj, methodName, originMethod) => {
      hookSuc += 1
    })

    expect(hookSuc).to.above(1)

    Reflect.ownKeys(window).forEach(keyName => {
      if (window[keyName] instanceof Function) {
        expect(window[keyName]).have.property('originMethod') &&
        expect(window[keyName]).not.eql(window[keyName].originMethod)
      }
    })

    hookJs.unHook(window, '**')
  })

  it('unHook整个window对象', () => {
    hookJs.hook(window, '**', () => {})
    hookJs.unHook(window, '**')

    Reflect.ownKeys(window).forEach(keyName => {
      if (window[keyName] instanceof Function) {
        expect(window[keyName]).not.have.property('originMethod')
        expect(window[keyName]).not.have.property('hookMethod')
      }
    })
  })

  it('classHook测试', () => {
    let result = false

    hookJs.hookClass(window, 'XMLHttpRequest', () => {
      result = true
    })

    const xhr = new XMLHttpRequest()

    expect(result).to.equal(true)
    expect(XMLHttpRequest).have.property('originMethod')
    expect(xhr).not.have.property('originMethod')

    hookJs.unHook(window, 'XMLHttpRequest')
  })

  it('funcHook和classHook互斥测试', () => {
    let result = false
    window.HookTest = function () {}
    hookJs.hook(window, 'HookTest', () => {
      result = true
    })

    hookJs.hookClass(window, 'HookTest', () => {
      result = true
    })

    let hookTestInstance = new window.HookTest()

    /* 当funcHook和classHook同时hook一个对象时只有前一个hook能生效，不支持同时hook */
    expect(result).to.equal(false)
    expect(window.HookTest.isClassHook).to.equal(false)
    expect(window.HookTest).have.property('originMethod')
    expect(hookTestInstance).not.have.property('originMethod')
    window.HookTest()
    expect(result).to.equal(true)

    /* funcHook被彻底unHook后能修改为classHook */
    hookJs.unHook(window, 'HookTest')
    hookJs.hookClass(window, 'HookTest', () => {
      result = 'classHook'
    })
    expect(window.HookTest.isClassHook).to.equal(true)
    hookTestInstance = new window.HookTest()
    expect(hookTestInstance).not.have.property('originMethod')
    expect(result).to.equal('classHook')

    hookJs.unHook(window, 'HookTest')
  })
})

describe('hookJs别名测试', () => {
  ['before', 'after', 'replace', 'error', 'hangUp'].forEach((type) => {
    it('hookJs别名：' + type, () => {
      let result = ''

      if (type === 'error') {
        hookJs[type](document, 'createElement', () => {
          result = type
        })

        expect(document.createElement).to.throw() && expect(result).to.equal(type)
      } else {
        hookJs[type](console, 'info', () => {
          result = type
        })
        console.info('hookJs别名：' + type)
      }

      expect(result).to.equal(type)
    })
  })
})

describe('hookJs功能应用测试', () => {
  it('hook window.EventTarget原型，事件派发、监听和移除监听的hook', () => {
    const hookResult = []

    hookJs.hook(window.EventTarget.prototype, '**', (args, parentObj, methodName, originMethod) => {
      hookResult.push(methodName)
    })
    window.addEventListener('load', () => {})
    window.removeEventListener('load', () => {})
    window.dispatchEvent(new Event('load'))
    hookJs.unHook(window.EventTarget.prototype, '**')

    expect(hookResult.length).to.equal(3)
    expect(hookResult).to.include('addEventListener')
    expect(hookResult).to.include('removeEventListener')
  })

  it('hook localStorage实现setItem可传入JSON和对localStorage的数据治理等', () => {
    const hookResult = []

    hookJs.hook(window.Storage.prototype, '**', (args, parentObj, methodName, originMethod) => {
      console.log(methodName)
      hookResult.push(methodName)

      /* 实现对JSON数据的直接写入 */
      if (methodName === 'setItem' && isObj(args[1])) {
        args[1] = JSON.stringify(args[1])
      }
    })

    localStorage.setItem('test', { test: 1 })
    const testVal = JSON.parse(localStorage.getItem('test'))
    expect(testVal.test).to.eq(1)
    expect(hookResult.length).to.above(1)

    hookJs.unHook(window.Storage.prototype, '**')
  })

  it('hook history让pushState和replaceState也可触发hashchange事件', () => {
    const hookResult = []

    hookJs.before(window.History.prototype, '**', (args, parentObj, methodName, originMethod) => {
      /* 让pushState和replaceState也能触发hashchange事件 */
      if (methodName === 'pushState' || methodName === 'replaceState') {
        parentObj[methodName]._oldUrl = location.href
      }
    })

    hookJs.after(window.History.prototype, '**', (args, parentObj, methodName, originMethod) => {
      /* 让pushState和replaceState也能触发hashchange事件 */
      if (methodName === 'pushState' || methodName === 'replaceState') {
        parentObj[methodName]._newUrl = location.href
        if (parentObj[methodName]._oldUrl !== parentObj[methodName]._newUrl) {
          console.log(parentObj[methodName]._oldUrl, parentObj[methodName]._newUrl)
          window.dispatchEvent(new Event('hashchange'))
        }
      }
    })

    window.addEventListener('hashchange', function () {
      hookResult.push('hashchange')
      console.log('location changed!')
    })

    history.pushState('data', 'bar', '/bar1.html')
    history.replaceState({}, '', '/bar2.html')

    cy.get().should(() => {
      expect(hookResult.length).to.equal(2)
    })

    hookJs.unHook(window.History.prototype, '**')
  })

  it('hook setInterval、setTimeout实现对网页计时器的全局控制', () => {
    const hookResult = []

    const hookRule = ['setInterval', 'setTimeout', 'clearInterval', 'clearTimeout']

    const hookCallback = function (execArgs, parentObj, methodName, originMethod, info, ctx) {
      if (['setTimeout', 'setInterval'].includes(methodName)) {
        const originArg0 = execArgs[0]
        execArgs[0] = () => {
          hookResult.push(1)
          originArg0()
        }
        execArgs[1] = execArgs[1] * (window.timeRate || 1.2)
      }
      console.log(`${toStr(parentObj)} [${methodName}] `, execArgs)
    }

    hookJs.hook(window, hookRule, hookCallback)

    setInterval(() => {}, 500)

    /* 按不同的数字键，让计时器以不同的倍率运行 */
    document.addEventListener('keydown', function (event) {
      if (event.ctrlKey && event.altKey) {
        const num = Number(event.key)
        if (num > 0) {
          window.timeRate = 1 / num
          console.log(`[当前时间倍率]${window.timeRate}`)
        }
      }
    }, true)

    cy.get().should(() => {
      expect(hookResult.length).to.above(2)
    })
  })
})
