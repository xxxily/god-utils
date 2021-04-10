import './comment'
import monkeyMenu from '../common/monkeyMenu'
import { isFunction, isObj } from '../../libs/utils'
import Debug from '../../libs/utils/Debug'
import modList from './module/index'

/* 强制标识当前处于调试模式 */
window._debugMode_ = true
const debug = Debug.create('myscript02 message:')

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
    monkeyMenu.on(conf.describe || 'no describe', () => {
      alert('当前匹配规则：\n' + JSON.stringify(conf.match, null, 2))
    })
  }
}

/**
 * 任务队列
 * @type {[*]}
 */
const taskMap = []

/* 添加任务配置到TaskMap */
function addTaskMap (taskConfList) {
  taskConfList = Array.isArray(taskConfList) ? taskConfList : [taskConfList]
  taskConfList.forEach(taskConf => {
    if (isObj(taskConf) && taskConf.match && isFunction(taskConf.run)) {
      taskMap.push(taskConf)
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
  /* 注册相关模块 */
  moduleSetup(modList)

  /* 运行任务队列 */
  runTaskMap(taskMap)
}
init()
