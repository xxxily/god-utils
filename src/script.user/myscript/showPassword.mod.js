/*!
 * @name         showPassword.mod.js
 * @description  显示当前页面密码的模块
 * @version      0.0.1
 * @author       Blaze
 * @date         2020/12/8 11:02
 * @github       https://github.com/xxxily
 */

import monkeyMenu from '../common/monkeyMenu'
import ready from '../../libs/utils/ready'
import copyText from '../../libs/utils/copyText'

let hasInit = false
function init (el) {
  /* 支持直接复制密码域下的密码 */
  el.addEventListener('keyup', event => {
    const key = event.key.toLowerCase()
    if (event.ctrlKey && key === 'c') {
      setTimeout(() => { copyText(event.target.value) }, 100)
    }
  })

  if (hasInit) return
  hasInit = true

  monkeyMenu.on('查看密码域内容', () => {
    const pwdEls = document.querySelectorAll('input[type="password"]')
    const pwdArr = []

    pwdEls.forEach(pwdEl => {
      window.prompt('密码域内容：', pwdEl.value)
      copyText(pwdEl.value)
      pwdArr.push({
        el: pwdEl,
        pwd: pwdEl.value
      })
    })

    console.log('当前页面密码信息：', pwdArr)
  })
}

export default {
  async setup () {
    ready('input[type="password"]', (el) => {
      init(el)
    })
  }
}
