/*!
 * @name         menuManager.js
 * @description  菜单管理器
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/08/11 10:05
 * @github       https://github.com/xxxily
 */

import monkeyMenu from '../common/monkeyMenu'
import config from './config'
import debug from './debug'

function refreshPage (msg) {
  debug.log('[config]', JSON.stringify(config, null, 2))

  msg = msg || '配置已更改，马上刷新页面让配置生效？'
  const status = confirm(msg)
  if (status) {
    window.location.reload()
  }
}

let monkeyMenuList = [
  {
    title: '还原默认配置',
    fn: () => {
      localStorage.removeItem('_myscriptConfig_')
      refreshPage()
    }
  },
  {
    title: config.enhanceTools.waterMarkEraser ? '关闭waterMarkEraser' : '开启waterMarkEraser',
    fn: () => {
      config.enhanceTools.waterMarkEraser = !config.enhanceTools.waterMarkEraser
      refreshPage()
    }
  },
  {
    title: config.debugTools.debuggerEraser ? '关闭debuggerEraser' : '开启debuggerEraser',
    fn: () => {
      config.debugTools.debuggerEraser = !config.debugTools.debuggerEraser
      refreshPage()
    }
  },
  {
    title: config.debugTools.consoleProxy ? '关闭consoleProxy' : '开启consoleProxy',
    fn: () => {
      config.debugTools.consoleProxy = !config.debugTools.consoleProxy
      refreshPage()
    }
  },
  {
    title: config.debugTools.timerManager.enabled ? '关闭timerManager' : '开启timerManager',
    fn: () => {
      config.debugTools.timerManager.enabled = !config.debugTools.timerManager.enabled
      refreshPage()
    }
  },
  {
    title: config.debugTools.eruda ? '关闭eruda' : '开启eruda',
    fn: () => {
      config.debugTools.eruda = !config.debugTools.eruda
      refreshPage()
    }
  },
  {
    title: config.debugTools.vconsole ? '关闭vconsole' : '开启vconsole',
    fn: () => {
      config.debugTools.vconsole = !config.debugTools.vconsole
      refreshPage()
    }
  },
  {
    title: config.debugTools.debugModeTag ? '关闭【调试模式】标识' : '开启【调试模式】标识',
    fn: () => {
      config.debugTools.debugModeTag = !config.debugTools.debugModeTag
      refreshPage()
    }
  }
]

/* 菜单构造函数（必须是函数才能在点击后动态更新菜单状态） */
function menuBuilder () {
  return monkeyMenuList
}

/* 注册动态菜单 */
export function menuRegister () {
  monkeyMenu.build(menuBuilder)
}

/**
 * 增加菜单项
 * @param {Object|Array} menuOpts 菜单的配置项目，多个配置项目用数组表示
 */
export function addMenu (menuOpts) {
  menuOpts = Array.isArray(menuOpts) ? menuOpts : [menuOpts]
  menuOpts = menuOpts.filter(item => item.title && !item.disabled)
  monkeyMenuList = monkeyMenuList.concat(menuOpts)

  console.log('[monkeyMenuList]', monkeyMenuList)

  /* 重新注册菜单 */
  menuRegister()
}
