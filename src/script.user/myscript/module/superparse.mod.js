/*!
 * @name         superparse.mod.js
 * @description  在线视频下载解析
 * @version      0.0.1
 * @author       Blaze
 * @date         2021/1/5 9:59
 * @github       https://github.com/xxxily
 */

import { ready, parseURL } from '../../../libs/utils'
import monkeyMenu from '../../common/monkeyMenu'

const taskConf = {
  match: [
    'superparse.com'
  ],
  describe: '解析视频下载地址',
  run: function () {
    const urlInfo = parseURL(window.top.location.href)
    if (!urlInfo.params.url) {
      return false
    }

    ready('input.form-control', function (el) {
      el.value = decodeURIComponent(urlInfo.params.url)
      document.querySelector('.input-group-btn button').click()
    })
  }
}

function addParseBtn () {
  if (location.host === 'superparse.com') {
    return false
  }

  // const supportHost = [
  //   'twitter.com',
  //   'youtube.com'
  // ]

  monkeyMenu.on('使用superparse解析视频地址', () => {
    const url = encodeURIComponent(window.top.location.href)
    if (window.GM_openInTab) {
      window.GM_openInTab('https://superparse.com/zh?url=' + url, true)
    }
  })
}

export default {
  setup (addTaskMap) {
    addTaskMap(taskConf)
    addParseBtn()
  }
}
