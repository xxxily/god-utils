import './comment'
import monkeyMenu from '../common/monkeyMenu'
import ready from '../../libs/utils/ready'
import millisecondToDate from '../../libs/utils/millisecondToDate'
import { isFunction, isObj } from '../../libs/utils'
import Debug from '../../libs/utils/Debug'
import modList from './module/index'

/* 强制标识当前处于调试模式 */
window._debugMode_ = true
const debug = Debug.create('myscript message:')

/* 劫持localStorage.setItem 方法，增加修改监听功能 */
const orignalLocalStorageSetItem = localStorage.setItem
localStorage.setItem = function (key, newValue) {
  const setItemEvent = new Event('localStorageSetItemEvent')
  setItemEvent.newValue = newValue
  setItemEvent.keyName = key
  window.dispatchEvent(setItemEvent)

  /* 尝试对json对象进行兼容 */
  if (Object.prototype.toString.call(newValue) === '[object Object]') {
    try {
      newValue = JSON.stringify(newValue)
      arguments[1] = newValue
    } catch (e) {
      console.error(e)
    }
  }

  orignalLocalStorageSetItem.apply(this, arguments)
}

/**
 * 匹配某个URL字段，然后运行对应的callback
 * @param matchItem (String|Array) -必选 要匹配的url字符串
 * @param callback (Function) -必选 要处理的回调方法
 */
function matchAndRun (matchItem, callback, conf) {
  conf = conf || {}

  if (typeof matchItem === 'undefined' || typeof callback !== 'function') {
    console.log('传入的参数不正确')
    return false
  }

  if (conf.disable) {
    return false
  }

  let hasMatchItem = false
  matchItem = Array.isArray(matchItem) ? matchItem : [matchItem]
  matchItem.forEach((matchStr) => {
    const regEx = new RegExp(matchStr, 'i')
    if (regEx.test(window.location.href)) {
      hasMatchItem = true
      callback(matchStr, conf)
      if (window !== top) {
        debug.log(`个人脚本规则在ifram里生效：${conf.describe || ''}`, conf)
      } else {
        debug.log(`个人脚本规则生效：${conf.describe || ''}`, conf)
      }
    }
  })

  if (hasMatchItem) {
    monkeyMenu.on(conf.describe || 'no describe', () => {
      alert('当前匹配规则：\n' + JSON.stringify(conf.match, null, 2))
    })
  }
}

/**
 * 任务队列
 * @type {[*]}
 */
const taskMap = [
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
    match: [
      'https://fort.qiweioa.cn/#/login',
      'https://fort.qiweioa.cn/#/desktop'
    ],
    describe: '云匣子自动刷新，防止长时间无操作自动退出登录',
    run: function () {
      const curTime = Date.now()
      const reloadInterval = 10
      console.log('云匣子自动刷新脚本已注入，刷新频率：' + reloadInterval + '分钟')
      setTimeout(function () {
        window.location.reload()
      }, 1000 * 60 * reloadInterval)

      setInterval(function () {
        console.log('当前页面已运行：' + millisecondToDate(Date.now() - curTime, true))
      }, 1000 * 30)
    }
  },

  {
    match: 'https://fort.qiweioa.cn/connect.html',
    describe: '云匣子控制台自动重连',
    run: function () {
      const curTime = Date.now()
      let reconnectCount = 0
      setInterval(function () {
        console.log('当前页面已运行：' + millisecondToDate(Date.now() - curTime, true))
        const confirmBtn = document.querySelector('.yab-proxy-messagebox .confirmButtonCls')
        if (confirmBtn && confirmBtn.innerText === '重新连接') {
          confirmBtn.click()
          reconnectCount += 1
          console.log('控制台已重新连接，重连次数：' + reconnectCount)
        }
      }, 1000 * 30)
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
  }
]

/* 添加任务配置到TaskMap */
function addTaskMap (taskConfList) {
  taskConfList = Array.isArray(taskConfList) ? taskConfList : [taskConfList]
  taskConfList.forEach(taskConf => {
    if (isObj(taskConf) && taskConf.match && isFunction(taskConf.run)) {
      taskMap.push(taskConf)
    }
  })
}

function runTaskMap (taskMap) {
  if (!taskMap || taskMap.length === 0) {
    console.log('没有要执行的任务队列！')
    return false
  }

  // 递归处理任务队列
  const taskLen = taskMap.length
  for (let i = 0; i < taskLen; i++) {
    const item = taskMap[i]
    if (!item.disable) {
      matchAndRun(item.match, item.run, item)
    }
  }
}

function moduleSetup (mods) {
  if (!mods) return false

  mods = Array.isArray(mods) ? mods : [mods]
  mods.forEach(modItem => {
    if (modItem && isFunction(modItem.setup)) {
      if (modItem._isSetup_) return false

      modItem.setup(addTaskMap)
      modItem._isSetup_ = true
    } else {
      debug.error('模块安装失败！', modItem)
    }
  })
}

/**
 * 脚本入口
 */
function init () {
  /* 注册相关模块 */
  moduleSetup(modList)

  /* 运行任务队列 */
  runTaskMap(taskMap)
}
init()
