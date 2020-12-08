/*!
 * @name         autoRefresh.js
 * @description  自动刷新页面
 * @version      0.0.1
 * @author       Blaze
 * @date         2020/12/8 10:33
 * @github       https://github.com/xxxily
 */

import ready from '../../libs/utils/ready'
import monkeyMenu from '../common/monkeyMenu'
import jsonParse from './jsonParse'
import { getPageWindow } from '../common/getPageWindow'

/**
 * 自动刷新页面
 * @param timeout {undefined|number} -可选 当数值为undefined时候，自动读取本地localStorage里的配置执行相关逻辑
 * 当传入数值为-1时，则取消自动刷新逻辑，当为正数时，则表示指定刷新页面的时间间隔
 * @param selector {string} -可选 指定某个选择器，只有页面在指定的时间内依然无法读取到该选择器时才进行刷新
 * @returns {boolean}
 */
function autoRefresh (timeout, selector) {
  if (!timeout && !localStorage.getItem('_autoRefreshConfig_')) {
    return false
  }

  const conf = jsonParse(localStorage.getItem('_autoRefreshConfig_'))
  const urlId = encodeURIComponent(location.href)

  if (timeout === -1) {
    /* 取消页面自动刷新 */
    delete conf[urlId]
    localStorage.setItem('_autoRefreshConfig_', JSON.stringify(conf))
    clearTimeout(window._autoRefreshTimer_)
    alert('自动刷新取消成功~')
    return true
  } else if (typeof timeout === 'number') {
    /* 设置自动刷新 */
    conf[urlId] = {
      timeout,
      refreshCount: 0,
      selector: selector || ''
    }
    localStorage.setItem('_autoRefreshConfig_', JSON.stringify(conf))
    clearTimeout(window._autoRefreshTimer_)
  }

  /* 执行自动刷新 */
  if (conf[urlId] && conf[urlId].timeout) {
    let selectorReady = false
    if (conf[urlId].selector) {
      ready(conf[urlId].selector, () => {
        selectorReady = true
      })
    }

    window._autoRefreshTimer_ = setTimeout(async function () {
      if (selectorReady === true) {
        return true
      }

      conf[urlId].refreshCount += 1
      localStorage.setItem('_autoRefreshConfig_', JSON.stringify(conf))
      window.location.reload()
    }, conf[urlId].timeout)
  }
}

/* 增加自动刷新功能的可视化操作按钮 */
monkeyMenu.on('自动刷新页面', () => {
  let timeout = prompt('设置刷新间隔/单位秒（-1表示取消刷新）', 10)
  timeout = Number(timeout)

  if (Number.isNaN(timeout)) {
    alert('请输入正确的时间间隔')
    return false
  }

  if (timeout >= 0) {
    autoRefresh(timeout * 1000)
  } else {
    autoRefresh(timeout)
  }
})

export default {
  autoRefresh: autoRefresh,
  async setup () {
    const win = await getPageWindow()
    win._autoRefresh_ = autoRefresh

    /* 每个页面都要检查是否需要执行自动刷新逻辑 */
    autoRefresh()
  }
}
