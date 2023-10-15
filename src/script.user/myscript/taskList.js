import ready from '../../libs/utils/ready'
// import millisecondToDate from '../../libs/utils/millisecondToDate'
import downloadJsonFile from '../../libs/utils/downloadJsonFile'
import debug from './debug'
import { elementWeakened } from './helper'

/**
 * 任务队列
 * @type {[*]}
 */
const taskList = [
  {
    match: 'douyin.com',
    describe: '抖音网页版体验优化',
    run: function () {
      ready('#videoSideBar .recommend-comment-login-mask', function (element) {
        element.style.display = 'none'
      })
    }
  },
  {
    match: 'youtube.com',
    describe: '自动跳过youtube广告',
    run: function () {
      ready('.ytp-ad-skip-button', function (element) {
        element.click()
      })
    }
  },
  {
    match: 'youtube.com',
    describe: '自动跳过开启广告展示的弹窗提醒',
    run: function () {
      ready('tp-yt-paper-dialog.ytd-popup-container', function (element) {
        if (element.innerText.includes('广告拦截')) {
          element.parentNode.removeChild(element)
        }
      })
    }
  },
  {
    match: 'youtube.com',
    describe: '隐藏油管Logo',
    run: function () {
      ready('#logo', function (element) {
        elementWeakened(element)
      })
    }
  },

  {
    match: 'google.com',
    describe: 'Google优化',
    run: function () {
      ready('img[alt=Google]', function (element) {
        elementWeakened(element)
      })

      ready('div.logo', function (element) {
        if (element.querySelector('img[alt=Google]')) {
          elementWeakened(element)
        }
      })
    }
  },

  {
    match: 'wenxuecity.com',
    describe: '忽略文学城弹框',
    run: function () {
      ready('.wxc-ab-root', function (element) {
        element.parentNode.removeChild(element)
        setInterval(function () {
          document.body.style.position = 'inherit'
        }, 120)
      })
    }
  },

  {
    match: 'baidu.com',
    describe: '过滤百度搜索结构的广告',
    disable: true,
    run: function () {
      function delBaiduAd () {
        const resultDom = document.querySelectorAll('#content_left>div')
        console.clear()
        console.log('百度广告过滤', resultDom)
        for (let i = 0; i < resultDom.length; i++) {
          const className = resultDom[i].className
          if (!/result/.test(className)) {
            resultDom[i].remove()
          }
        }
      }

      delBaiduAd()
      setTimeout(function () {
        delBaiduAd()
      }, 1500)
    }
  },

  {
    match: 'btdx8.com',
    describe: '自动下载比特大雄的bt文件，减少人工点击次数',
    run: function () {
      // 种子文件介绍页
      if (/torrent/.test(window.location.href)) {
        const aimDom = document.querySelectorAll('#zdownload a')
        if (!aimDom || aimDom.length === 0) {
          console.error('当前页面没匹配到种子结果！')
          return false
        }
        if (aimDom.length > 1) {
          for (let i = 0; i < aimDom.length; i++) {
            aimDom[i].click()
          }
        } else {
          // 设置当前页面打开
          aimDom[0].setAttribute('target', '_self')
          aimDom[0].click()
        }
      }

      // 种子文件下载页
      if (/down\.php/.test(window.location.href)) {
        const aimDom = document.querySelectorAll('#down_verify_box .btn-orange')
        if (aimDom && aimDom.length === 1) {
          aimDom[0].click()
          const timeOut = setInterval(function () {
            const downA1 = document.getElementById('downA1')
            if (downA1) {
              const link = downA1.href.trim()
              if (link && link !== 'javascript:;') {
                downA1.setAttribute('target', '_self')
                downA1.click()
                clearTimeout(timeOut)
                setTimeout(function () {
                  window.top.close()
                }, 400)
              }
            }
          }, 550)
        }
      }
    }
  },

  {
    match: [
      'jianshu.com',
      'zhihu.com'
    ],
    describe: '去掉地址跳转被中转拦截',
    run: function () {
      ready('a', function (element) {
        const url = element.href
        const splitStrArr = [
          'links.jianshu.com/go?to=',
          'link.zhihu.com/?target='
        ]

        for (let i = 0; i < splitStrArr.length; i++) {
          const splitStr = splitStrArr[i]
          if (url.includes(splitStr)) {
            const realUrl = decodeURIComponent(url.split(splitStr)[1])
            element.href = realUrl
            break
          }
        }
      })
    }
  },

  {
    match: [
      'blog.csdn.net',
      'zhihu.com'
    ],
    describe: '关闭烦人的登录弹窗',
    run: function () {
      ready(['.login-mark', 'div.Modal-backdrop'], element => {
        element.click()
        debug.log('检测到烦人的登录提示弹框，已主动为你关闭，如果又误关闭，请提醒作者优化脚本逻辑，或关掉该脚本')
      })
    }
  },

  {
    match: [
      'lanhuapp.com'
    ],
    describe: '解决蓝湖按键误触问题',
    run: function () {
      window.addEventListener('keyup', (event) => {
        console.log('stop keyup event', event)
        if (event.ctrlKey && event.key === 'ArrowRight') {
          event.stopPropagation()
          event.stopImmediatePropagation()
          return false
        }
      }, true)
    }
  },

  {
    match: 'icloudnative.io',
    describe: 'icloudnative体验优化',
    run: function () {
      ready('.wrapper__left .join-us', function (element) {
        element.style.display = 'none'
      })
    }
  },

  {
    match: 'hi-linux.com',
    describe: 'Linux世界阅读体验优化',
    run: function () {
      ready('#vip-container', function (element) {
        setTimeout(() => {
          element.style.height = '100%'
          const readMore = element.querySelector('#read-more-wrap')
          readMore && (readMore.style.visibility = 'hidden')
        }, 1000)
      })
    }
  },

  {
    match: 'yiyan.baidu.com',
    describe: '文心去水印',
    run: function () {
      ready('#root', function (element) {
        // alert('文心去水印');
        setTimeout(() => {
          element.style.zIndex = '99999999999'
          element.style.position = 'fixed'
          element.style.top = '0'
          element.style.left = '0'
          element.style.width = '100%'
          element.style.height = '100%'
          element.style.backgroundColor = 'rgba(0, 0, 0, 1)'
        }, 1000)
      })
    }
  },

  {
    match: 'processon.com',
    describe: 'ProcessOn模版下载',
    run: function () {
      async function downloadPos () {
        /* 发起get请求 */
        const id = location.pathname.replace('/view/', '')
        const url = `https://www.processon.com/api/personal/diagraming/getdef?id=${id}`
        const res = await fetch(url)
        const data = await res.json()
        const elements = JSON.parse(data.data.def)

        const posJson = {
          diagram: {
            elements
          },
          meta: {
            exportTime: '',
            member: '',
            diagramInfo: {
              creator: '',
              created: '',
              modified: '',
              title: elements.title,
              category: 'mind_free'
            },
            id: '',
            type: 'ProcessOn Schema File',
            version: '1.0'
          }
        }

        console.log(`[diagraming.pos][${elements.title}]`, posJson)
        downloadJsonFile(`${elements.title}.pos`, posJson)
        // alert('请在控制台查看数据')
      }

      if (location.href.includes('processon.com/view/')) {
        ready('.main-content .file_head_right', function (element) {
          const downBtn = document.createElement('button')
          downBtn.className = 'button file_head_right_item'
          downBtn.innerText = '下载POS文件'
          downBtn.addEventListener('click', downloadPos)
          element.appendChild(downBtn)
        })
      }
    }
  }
]

export default taskList
