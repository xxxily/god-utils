/* 代理windo对象 */
const proxyHandler = {
  get: (target, name) => {
    console.log('[proxy get]', name, target)
    return typeof target[name] === 'function'
      ? target[name].bind(target)
      : target[name]
  },
  set: (obj, prop, value) => {
    console.log('[proxy set]', prop, value)
    obj[prop] = value
  },
  defineProperty (target, key, descriptor) {
    console.log('[proxy defineProperty]', target, key, descriptor)
    return true
  },
  apply (target, ctx, args) {
    console.log('[proxy apply]', target, args)
    // return target.apply(ctx, args)
    return Reflect.apply(...arguments)
  }
}

function proxyHandlerGenerator () {
  const proxyHandler = {}
  const methodsList = [
    'get',
    'set',
    'has',
    'deleteProperty',
    'ownKeys',
    'getOwnPropertyDescriptor',
    'defineProperty',
    'preventExtensions',
    'getPrototypeOf',
    'isExtensible',
    'setPrototypeOf',
    'apply',
    'construct'
  ]
  methodsList.forEach(methodName => {
    if(methodName === 'get'){
      proxyHandler.get = function (target, name){
        console.log(`[proxy generator ${methodName}]`, target, name)
        return typeof target[name] === 'function'
          ? target[name].bind(target)
          : Reflect[methodName](...arguments)
      }
    }else {
      proxyHandler[methodName] = function () {
        console.log(`[proxy generator ${methodName}]`)
        return Reflect[methodName](...arguments)
      }
    }
  })
  return proxyHandler
}

export {proxyHandler, proxyHandlerGenerator}
