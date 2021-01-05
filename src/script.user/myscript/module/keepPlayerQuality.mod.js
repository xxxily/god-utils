/*!
 * @name         keepPlayerQuality.mod.js
 * @description  锁定视频播放画质
 * @version      0.0.1
 * @author       Blaze
 * @date         2021/1/5 11:00
 * @github       https://github.com/xxxily
 */

import ready from '../../../libs/utils/ready'
import attrObserver from '../../../libs/utils/attrObserver'

function keepYoutubeQuality () {
  ready(['#player-container .ytp-settings-menu'], element => {
    /* 通过模拟操作获取或设置视频画质 */
    function ytpQuality (quality) {
      const qualityResult = []
      const settingsMenu = document.querySelector('#player-container .ytp-settings-menu')
      const settingsBtn = document.querySelector('#player-container .ytp-settings-button')
      if (settingsMenu) {
        if (settingsMenu.style.display === 'none') {
          settingsMenu.style.opacity = 0
          settingsBtn.click()
        }

        const menuitem = settingsMenu.querySelectorAll('.ytp-panel-menu .ytp-menuitem')
        /* 选中最后一项 */
        menuitem[menuitem.length - 1].click()

        const qualityMenuitem = settingsMenu.querySelectorAll('.ytp-quality-menu .ytp-panel-menu .ytp-menuitem')
        qualityMenuitem.forEach(el => {
          const txt = el.innerText
          if (quality && txt.toLowerCase().startsWith(quality)) {
            el.click()
            console.log('已设置视频画质：' + txt)
          }
          const checked = Boolean(el.getAttribute('aria-checked')) || false
          qualityResult.push({
            quality: txt,
            checked
          })
        })

        /* 关闭设置面板 */
        setTimeout(function () {
          if (settingsMenu.style.display !== 'none') {
            settingsBtn.click()
          }
          setTimeout(function () {
            settingsMenu.style.opacity = 1
          }, 600)
        }, 0)
      }

      if (settingsBtn && !qualityResult.length) {
        console.error('未获取到当前视频页面的画质信息')
      }

      return qualityResult
    }

    function getCurYtpQuality () {
      let curQuality = ''
      const qualityList = ytpQuality()
      for (let i = 0; i < qualityList.length; i++) {
        const item = qualityList[i]
        if (item.checked) {
          curQuality = item.quality
          break
        }
      }
      return curQuality
    }

    function saveCurYtpQuality () {
      const settingsMenu = document.querySelector('#player-container .ytp-settings-menu')
      if (!settingsMenu || settingsMenu.style.display !== 'none' || document.visibilityState !== 'visible') {
        return false
      }

      /* 通过自带控制选项保持播放画质 */
      let localYtpQuality = localStorage.getItem('yt-player-quality')
      const customYtpQuality = localStorage.getItem('_ytpQuality_')

      if (localYtpQuality) {
        localYtpQuality = JSON.parse(localYtpQuality)
        localYtpQuality.expiration = Date.now() + 1000 * 60 * 60 * 24 * 365
        localStorage.setItem('yt-player-quality', JSON.stringify(localYtpQuality))

        /* 如果当前画质一致则不需要通过模拟操作更新画质 */
        if (customYtpQuality && localYtpQuality.data.endsWith(customYtpQuality.split('p')[0])) {
          return true
        }
      }

      /* 通过模拟画面保持播放画质 */
      const curQuality = getCurYtpQuality()
      if (curQuality && /\d+p/.test(curQuality.toLowerCase())) {
        localStorage.setItem('_ytpQuality_', curQuality)
      }
    }
    /* 自动记录选定的播放画质 */
    setInterval(() => {
      saveCurYtpQuality()
    }, 1000 * 5)

    function setYtpQualityByLocalStorageVal () {
      const customYtpQuality = localStorage.getItem('_ytpQuality_')
      if (customYtpQuality) {
        const quality = customYtpQuality.toLowerCase().split('p')[0] + 'p'
        ytpQuality(quality)
      } else {
        /* 默认设置为1080p画质 */
        ytpQuality('1080p')
        saveCurYtpQuality()
      }
    }
    setYtpQualityByLocalStorageVal()

    /* 视频地址发生改变时重新执行画质设置逻辑 */
    let pageUrl = location.href
    attrObserver(['#player-container video'], () => {
      if (pageUrl !== location.href) {
        pageUrl = location.href
        setYtpQualityByLocalStorageVal()
      }
    }, ['src'])
  })
}

const taskConf = {
  match: [
    'youtube.com'
  ],
  describe: '记住播放画质',
  run: function () {
    /* 目前只适配了油管 */
    keepYoutubeQuality()
  }
}

export default {
  setup (addTaskMap) {
    addTaskMap(taskConf)
  }
}
