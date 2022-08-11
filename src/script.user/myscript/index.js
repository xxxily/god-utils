import './comment'
import config from './config'
import setDebugMode from './libs/setDebugMode'
import { isFunction, isObj } from '../../libs/utils'
import debug from './debug'
import modList from './module/index'
import waterMarkEraser from './libs/waterMarkEraser'
import { registerDebuggerEraser } from './libs/debuggerEraser'
import taskList from './taskList'
import { menuRegister, addMenu } from './menuManager'

/* 劫持localStorage.setItem 方法，增加修改监听功能 */
const orignalLocalStorageSetItem = localStorage.setItem
localStorage.setItem = function (key, newValue) {
  const setItemEvent = new Event('localStorageSetItemEvent')
  setItemEvent.newValue = newValue
  setItemEvent.keyName = key
  window.dispatchEvent(setItemEvent)

  /* 尝试对json对象进行兼容 */
  if (Object.prototype.toString.call(newValue) === '[object Object]') {
    try {
      newValue = JSON.stringify(newValue)
      arguments[1] = newValue
    } catch (e) {
      console.error(e)
    }
  }

  orignalLocalStorageSetItem.apply(this, arguments)
}

/**
 * 匹配某个URL字段，然后运行对应的callback
 * @param matchItem (String|Array) -必选 要匹配的url字符串
 * @param callback (Function) -必选 要处理的回调方法
 */
function matchAndRun (matchItem, callback, conf) {
  conf = conf || {}

  if (typeof matchItem === 'undefined' || typeof callback !== 'function') {
    console.log('传入的参数不正确')
    return false
  }

  if (conf.disable) {
    return false
  }

  let hasMatchItem = false
  matchItem = Array.isArray(matchItem) ? matchItem : [matchItem]
  matchItem.forEach((matchStr) => {
    const regEx = new RegExp(matchStr, 'i')
    if (regEx.test(window.location.href)) {
      hasMatchItem = true
      callback(matchStr, conf)
      if (window !== top) {
        debug.log(`个人脚本规则在ifram里生效：${conf.describe || ''}`, conf)
      } else {
        debug.log(`个人脚本规则生效：${conf.describe || ''}`, conf)
      }
    }
  })

  if (hasMatchItem) {
    addMenu({
      title: conf.describe || 'no describe',
      disable: conf.disable || false,
      fn: () => {
        alert('当前匹配规则：\n' + JSON.stringify(conf.match, null, 2))
      }
    })
  }
}

/* 添加任务配置到TaskMap */
function addTaskMap (taskConfList) {
  taskConfList = Array.isArray(taskConfList) ? taskConfList : [taskConfList]
  taskConfList.forEach(taskConf => {
    if (isObj(taskConf) && taskConf.match && isFunction(taskConf.run)) {
      taskList.push(taskConf)
    }
  })
}

function runTaskMap (taskMap) {
  if (!taskMap || taskMap.length === 0) {
    console.log('没有要执行的任务队列！')
    return false
  }

  // 递归处理任务队列
  const taskLen = taskMap.length
  for (let i = 0; i < taskLen; i++) {
    const item = taskMap[i]
    if (!item.disable) {
      matchAndRun(item.match, item.run, item)
    }
  }
}

function moduleSetup (mods) {
  if (!mods) return false

  mods = Array.isArray(mods) ? mods : [mods]
  mods.forEach(modItem => {
    if (modItem && isFunction(modItem.setup)) {
      if (modItem._isSetup_) return false

      modItem.setup(addTaskMap)
      modItem._isSetup_ = true
    } else {
      debug.error('模块安装失败！', modItem)
    }
  })
}

/**
 * 脚本入口
 */
function init () {
  /* 开启相关辅组插件 */
  config.debugTools.debugModeTag && setDebugMode()
  config.enhanceTools.waterMarkEraser && waterMarkEraser()
  config.debugTools.debuggerEraser && registerDebuggerEraser()
  config.debugTools.eruda && window.eruda && window.eruda.init()
  config.debugTools.vconsole && window.VConsole && (new window.VConsole())

  /* 注册菜单 */
  menuRegister()

  /* 注册相关模块 */
  moduleSetup(modList)

  /* 运行任务队列 */
  runTaskMap(taskList)

  debug.log('init success')
}
init()
