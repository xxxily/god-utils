/*!
 * @name         qqDocsBlocker.mod.js
 * @description  腾讯文档无脑上报请求拦截器
 * @version      0.0.1
 * @author       Blaze
 * @date         2021/12/23 15:08
 * @github       https://github.com/xxxily
 */

import { add, getBlockList } from '../libs/ajaxBlocker'
// import monkeyMenu from '../../common/monkeyMenu'

const taskConf = {
  match: [
    'docs.qq.com'
  ],
  describe: '腾讯文档无脑上报请求拦截器',
  run: function () {
    const blockList = [
      'trace.qq.com',
      // 'aegis.qq.com',
      // 'beacon.qq.com',
      // 'report.idqqimg.com',
      // 'tpstelemetry.tencent.com',
      // 'report.url.cn'
    ]
    blockList.forEach(rule => { add(rule) })
    console.log('腾讯文档无脑上报请求拦截器:', JSON.stringify(getBlockList()))
  }
}

export default {
  setup (addTaskMap) {
    addTaskMap(taskConf)

    // let unhandledrejectionCount = 0
    // window.addEventListener('unhandledrejection', function (event) {
    //   unhandledrejectionCount++

    //   if (unhandledrejectionCount >= 100) {
    //     if (unhandledrejectionCount === 100) {
    //       console.warn('unhandledrejection 错误太多了')
    //     }

    //     return true
    //   }

    //   console.error('[unhandledrejection]', event)
    // }, true)
  }
}
