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
import monkeyMenu from '../../common/monkeyMenu'
import Debug from '../../../libs/utils/Debug'
import { quickSort } from '../../../libs/utils/number'
const debug = Debug.create('myscript message:')

function keepYoutubeQuality () {
  const youtubeQualitySetting = [
    {
      describe: '2160p 画质',
      value: '2160p'
    },
    {
      describe: '1440p 画质',
      value: '1440p'
    },
    {
      describe: '1080p 画质',
      value: '1080p'
    },
    {
      describe: '720p 画质',
      value: '720p'
    },
    {
      describe: '480p 画质',
      value: '480p'
    },
    {
      describe: 'auto 画质',
      value: 'auto'
    }
  ]

  const customYtpQuality = localStorage.getItem('_ytpQuality_')

  youtubeQualitySetting.forEach(item => {
    let menuText = '[YouTube] ' + item.describe
    if (customYtpQuality && customYtpQuality === item.value) {
      menuText += ' [ √ ]'
    }

    /* 生产指定画质菜单 */
    monkeyMenu.on(menuText, () => {
      localStorage.setItem('_ytpQuality_', item.value)

      setTimeout(() => {
        location.reload()
      }, 1000 * 1)
    })
  })

  ready(['#player-container .ytp-settings-menu'], element => {
    /* 通过模拟操作获取或设置视频画质 */
    function ytpQuality (quality, fallback) {
      let hasSetQuality = false
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
            debug.log('已设置视频画质：' + txt)
            hasSetQuality = true
          }
          const checked = Boolean(el.getAttribute('aria-checked')) || false
          qualityResult.push({
            quality: txt,
            checked,
            el
          })
        })

        /* 如果指定了画质，但是未被设置，说明没法命中指定画质，这时则指定当前可用的最优画质 */
        if (quality && !hasSetQuality && fallback) {
          const qNum = Number(quality.toLowerCase().split('p')[0])

          if (qNum) {
            /* 找出比当前指定画质小的元素 */
            let tmpArr = []
            const tmpObj = { }
            qualityResult.forEach(item => {
              const curQNum = Number(item.quality.toLowerCase().split('p')[0])
              if (curQNum < qNum) {
                tmpArr.push(curQNum)
                tmpObj[curQNum] = item
              }
            })
            tmpArr = quickSort(tmpArr)

            /* 设置符合当前条件下的最优画质 */
            const tagItem = tmpObj[tmpArr[tmpArr.length - 1]]
            if (tagItem && tagItem.el) {
              tagItem.el.click()
              hasSetQuality = true
              debug.log('已设置视频画质：' + tagItem.quality)
            }
            // debug.log('---------------：', tmpArr, tmpObj, tagItem)
          }
        }

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
    // setInterval(() => {
    //   saveCurYtpQuality()
    // }, 1000 * 5)

    function setYtpQualityByLocalStorageVal () {
      const customYtpQuality = localStorage.getItem('_ytpQuality_')
      if (customYtpQuality && customYtpQuality !== 'auto') {
        const quality = customYtpQuality.toLowerCase().split('p')[0] + 'p'
        ytpQuality(quality, true)
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
