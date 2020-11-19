/* 源码出自：https://juejin.im/post/6896637675492065287 */

/* 不支持循环引用 */
function deepClone01 (target) {
  if (target !== null && typeof target === 'object') {
    const result = Object.prototype.toString.call(target) === '[object Array]' ? [] : {}
    for (const k in target) {
      result[k] = deepClone01(target[k])
    }
    return result
  } else {
    return target
  }
}

/* 支持循环引用 */
function deepClone02 (target) {
  function clone (target, map) {
    if (target !== null && typeof target === 'object') {
      const result = Object.prototype.toString.call(target) === '[object Array]' ? [] : {}
      // let result = null
      // if (Object.prototype.toString.call(target) === '[object Array]') {
      //   result = []
      // } else {
      //   result = {}
      // }

      if (map[target]) {
        return map[target]
      }
      map[target] = result
      for (const k in target) {
        result[k] = clone(target[k], map)
      }
      return result
    } else {
      return target
    }
  }
  let map = {}
  const result = clone(target, map)
  map = null
  return result
}

/* 通过while遍历提升性能 */
function deepClone03 (target) {
  function clone (target, map) {
    if (target !== null && typeof target === 'object') {
      let result = null
      let length = 0
      let keys = []
      if (Object.prototype.toString.call(target) === '[object Array]') {
        result = []
        length = target.length
      } else {
        result = {}
        length = Object.keys(target).length
        keys = Object.keys(target)
      }
      if (map[target]) {
        return map[target]
      }
      map[target] = result

      let index = -1
      while (++index < length) {
        const key = keys[index]
        if (key) { // 处理 Object 数据
          result[key] = clone(target[key], map)
        } else { // 处理 Array 数据
          result[index] = clone(target[index], map)
        }
      }

      /* for in 实现，效率偏下 */
      // for (const k in target) {
      //   result[k] = clone(target[k], map)
      // }

      return result
    } else {
      return target
    }
  }
  let map = {}
  const result = clone(target, map)
  map = null
  return result
}

/* 支持更多复杂数据类型 */
function deepClone04 (target) {
  // 获取数据类型
  function getType (target) {
    return Object.prototype.toString.call(target)
  }
  // 判断数据是不是引用类型
  function isObject (target) {
    return target !== null && (typeof target === 'object' || typeof target === 'function')
  }

  function handleOherData (target) {
    const type = getType(target)
    switch (type) {
      case '[object Date]':
        return new Date(target)
      case '[object RegExp]':
        return cloneReg(target)
      case '[object Function]':
        return cloneFunction(target)
    }
  }
  // 拷贝Symbol类型数据
  function cloneSymbol (targe) {
    const a = String(targe) // 把Symbol字符串化
    const b = a.substring(7, a.length - 1) // 取出Symbol()的参数
    return Symbol(b) // 用原先的Symbol()的参数创建一个新的Symbol
  }
  // 拷贝正则类型数据
  function cloneReg (target) {
    const reFlags = /\w*$/
    const result = new target.constructor(target.source, reFlags.exec(target))
    result.lastIndex = target.lastIndex
    return result
  }
  // 拷贝函数
  function cloneFunction (targe) {
    // 匹配函数体的正则
    const bodyReg = /(?<={)(.|\n)+(?=})/m
    // 匹配函数参数的正则
    const paramReg = /(?<=\().+(?=\)\s+{)/
    const targeString = targe.toString()
    // 利用prototype来区分下箭头函数和普通函数，箭头函数是没有prototype的
    if (targe.prototype) { // 普通函数
      const param = paramReg.exec(targeString)
      const body = bodyReg.exec(targeString)
      if (body) {
        if (param) {
          const paramArr = param[0].split(',')
          // 使用 new Function 重新构造一个新的函数
          return new Function(...paramArr, body[0])
        } else {
          return new Function(body[0])
        }
      } else {
        return null
      }
    } else { // 箭头函数
      // eval和函数字符串来重新生成一个箭头函数
      return eval(targeString)
    }
  }
  /**
   * 遍历数据处理函数
   * @array 要处理的数据
   * @callback 回调函数，接收两个参数 value 每一项的值 index 每一项的下标或者key。
   * @returns {*}
   */
  function handleWhile (array, callback) {
    let index = -1
    const length = array.length
    while (++index < length) {
      callback(array[index], index)
    }
    return array
  }

  function clone (target, map) {
    if (isObject(target)) {
      let result = null
      if (getType(target) === '[object Array]') {
        result = []
      } else if (getType(target) === '[object Object]') {
        result = {}
      } else if (getType(target) === '[object Map]') {
        result = new Map()
      } else if (getType(target) === '[object Set]') {
        result = new Set()
      }

      // 解决循环引用
      if (map[target]) {
        return map[target]
      }
      map[target] = result

      if (getType(target) === '[object Map]') {
        target.forEach((value, key) => {
          result.set(key, clone(value, map))
        })
        return result
      } else if (getType(target) === '[object Set]') {
        target.forEach(value => {
          result.add(clone(value, map))
        })
        return result
      } else if (getType(target) === '[object Object]' || getType(target) === '[object Array]') {
        const keys = getType(target) === '[object Array]' ? undefined : Object.keys(target)

        function callback (value, key) {
          if (keys) {
            // 如果keys存在则说明value是一个对象的key，不存在则说明key就是数组的下标。
            key = value
          }
          result[key] = clone(target[key], map)
        }
        handleWhile(keys || target, callback)
      } else {
        result = handleOherData(target)
      }
      return result
    } else {
      if (getType(target) === '[object Symbol]') {
        return cloneSymbol(target)
      } else {
        return target
      }
    }
  }
  let map = {}
  const result = clone(target, map)
  map = null
  return result
}

export {
  deepClone01,
  deepClone02,
  deepClone03,
  deepClone04
}
