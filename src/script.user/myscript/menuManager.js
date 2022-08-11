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

let monkeyMenuList = [
  {
    title: config.enhanceTools.waterMarkEraser ? '关闭waterMarkEraser' : '开启waterMarkEraser',
    fn: () => {
      config.enhanceTools.waterMarkEraser = !config.enhanceTools.waterMarkEraser

      debug.log('[config.enhanceTools.waterMarkEraser]', config.enhanceTools.waterMarkEraser)
      const status = confirm('waterMarkEraser状态已更新，马上刷新页面？')
      if (status) {
        window.location.reload()
      }
    }
  },
  {
    title: config.debugTools.debuggerEraser ? '关闭debuggerEraser' : '开启debuggerEraser',
    fn: () => {
      config.debugTools.debuggerEraser = !config.debugTools.debuggerEraser

      debug.log('[config.debugTools.debuggerEraser]', config.debugTools.debuggerEraser)
      const status = confirm('debuggerEraser状态已更新，马上刷新页面？')
      if (status) {
        window.location.reload()
      }
    }
  },
  {
    title: config.debugTools.eruda ? '关闭eruda' : '开启eruda',
    fn: () => {
      config.debugTools.eruda = !config.debugTools.eruda

      debug.log('[config.debugTools.eruda]', config.debugTools.eruda)
      const status = confirm('eruda状态已更新，马上刷新页面？')
      if (status) {
        window.location.reload()
      }
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
