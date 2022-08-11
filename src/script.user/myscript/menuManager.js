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

  /* 重新注册菜单 */
  menuRegister()
}
