// ==UserScript==
// @name         个人定制脚本
// @namespace    http://xxxily.co
// @version      0.0.8
// @license      LGPLv3
// @description  个人专用脚本
// @author       Blaze
// @match        *://*/*
// @match        http://*/*
// @match        https://*/*
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        GM_getTabs
// @grant        GM_openInTab
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @license      GPL
// @run-at       document-start
// @updateURL    https://github.com/xxxily/god-utils/raw/master/dist/script.user/myscript.user.js
// @require      https://cdn.bootcss.com/jquery/3.5.1/jquery.min.js
// ==/UserScript==
(function (w) { if (w) { w.name = 'myscript'; } })();

/*!
 * @name      menuCommand.js
 * @version   0.0.1
 * @author    Blaze
 * @date      2019/9/21 14:22
 */

const monkeyMenu = {
  on (title, fn, accessKey) {
    return window.GM_registerMenuCommand && window.GM_registerMenuCommand(title, fn, accessKey)
  },
  off (id) {
    return window.GM_unregisterMenuCommand && window.GM_unregisterMenuCommand(id)
  },
  /* 切换类型的菜单功能 */
  switch (title, fn, defVal) {
    const t = this;
    t.on(title, fn);
  }
};

/**
 * 元素监听器
 * @param selector -必选
 * @param fn -必选，元素存在时的回调
 * @param shadowRoot -可选 指定监听某个shadowRoot下面的DOM元素
 * 参考：https://javascript.ruanyifeng.com/dom/mutationobserver.html
 */
function ready (selector, fn, shadowRoot) {
  const win = window;
  const docRoot = shadowRoot || win.document.documentElement;
  const MutationObserver = win.MutationObserver || win.WebKitMutationObserver;
  const listeners = docRoot._MutationListeners || [];

  function $ready (selector, fn) {
    // 储存选择器和回调函数
    listeners.push({
      selector: selector,
      fn: fn
    });

    /* 增加监听对象 */
    if (!docRoot._MutationListeners || !docRoot._MutationObserver) {
      docRoot._MutationListeners = listeners;
      docRoot._MutationObserver = new MutationObserver(() => {
        for (let i = 0; i < docRoot._MutationListeners.length; i++) {
          const item = docRoot._MutationListeners[i];
          check(item.selector, item.fn);
        }
      });

      docRoot._MutationObserver.observe(docRoot, {
        childList: true,
        subtree: true
      });
    }

    // 检查节点是否已经在DOM中
    check(selector, fn);
  }

  function check (selector, fn) {
    const elements = docRoot.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      element._MutationReadyList_ = element._MutationReadyList_ || [];
      if (!element._MutationReadyList_.includes(fn)) {
        element._MutationReadyList_.push(fn);
        fn.call(element, element);
      }
    }
  }

  const selectorArr = Array.isArray(selector) ? selector : [selector];
  selectorArr.forEach(selector => $ready(selector, fn));
}

/**
 * DOM对象属性监听器
 * @param selector {String|Element} -必选 可以是选择器也可以是已存在的dom对象，如果是选择器则会调用ready进行监听
 * @param fn {Function} -必选 属性变化时的回调函数
 * @param attrFilter {String|Array} -可选 指定监听的属性，如果不指定将监听所有属性的变化
 * @param shadowRoot
 */
function attrObserver (selector, fn, attrFilter, shadowRoot) {
  if (!selector || !fn) return false
  function _attrObserver (element) {
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    const observer = new MutationObserver(fn);
    const observeOpts = {
      attributes: true,
      attributeOldValue: true
    };

    if (attrFilter) {
      attrFilter = Array.isArray(attrFilter) ? attrFilter : [attrFilter];
      observeOpts.attributeFilter = attrFilter;
    }

    observer.observe(element, observeOpts);
  }

  if (typeof selector === 'string' || Array.isArray(selector)) {
    ready(selector, element => _attrObserver(element), shadowRoot);
  } else if (/Element/.test(Object.prototype.toString.call(selector))) {
    _attrObserver(selector);
  } else {
    return false
  }
}

/**
 * 将毫秒数转为天/时/分/秒的表达形式，一般用于展示耗时情况
 * @param msd {number} -必选 毫秒数
 * @param retuenDefText -可选 默认出数组信息，true则输出统计结果的默认文本
 * @returns {string|[number, number, number, number, number]}
 */
function millisecondToDate (msd, retuenDefText) {
  /* 数据预处理 */
  let msdTotal = parseFloat(msd);
  if (msdTotal < 0) msdTotal = 0;

  /**
   * parseInt(1/(1000*60*60*24))将出现计算异常
   * 所以需要加上Math.floor进行修正
   * 必须是向下取整，四舍五入或向上取整都将导致出现负数的情况
   * @param num
   * @returns {number}
   */
  function convert (num) {
    return parseInt(Math.floor(num))
  }

  /* 进行硬编码式的递归计算 */
  const oneMillisecond = 1;
  const oneSecond = oneMillisecond * 1000;
  const oneMinute = oneSecond * 60;
  const oneHour = oneMinute * 60;
  const oneDay = oneHour * 24;
  const dayCount = convert(msdTotal / oneDay);
  msdTotal = msdTotal - dayCount * oneDay;
  const hourCount = convert(msdTotal / oneHour);
  msdTotal = msdTotal - hourCount * oneHour;
  const minuteCount = convert(msdTotal / oneMinute);
  msdTotal = msdTotal - minuteCount * oneMinute;
  const secondCount = convert(msdTotal / oneSecond);
  msdTotal = msdTotal - secondCount * oneSecond;
  const millisecondCount = convert(msdTotal / oneMillisecond);
  const result = [dayCount, hourCount, minuteCount, secondCount, millisecondCount];

  /* 输出结果 */
  if (retuenDefText) {
    let str = '';
    const textMap = ['天', '小时', '分钟', '秒', '毫秒'];
    result.forEach((val, index) => {
      if (val) str += val + textMap[index] + ' ';
    });
    return str
  } else {
    return result
  }
}

class Debug {
  constructor (msg) {
    const t = this;
    msg = msg || 'debug message:';
    t.log = t.createDebugMethod('log', null, msg);
    t.error = t.createDebugMethod('error', null, msg);
    t.info = t.createDebugMethod('info', null, msg);
  }

  create (msg) {
    return new Debug(msg)
  }

  createDebugMethod (name, color, tipsMsg) {
    name = name || 'info';

    const bgColorMap = {
      info: '#2274A5',
      log: '#95B46A',
      error: '#D33F49'
    };

    return function () {
      if (!window._debugMode_) {
        return false
      }

      const curTime = new Date();
      const H = curTime.getHours();
      const M = curTime.getMinutes();
      const S = curTime.getSeconds();
      const msg = tipsMsg || 'debug message:';

      const arg = Array.from(arguments);
      arg.unshift(`color: white; background-color: ${color || bgColorMap[name] || '#95B46A'}`);
      arg.unshift(`%c [${H}:${M}:${S}] ${msg} `);
      window.console[name].apply(window.console, arg);
    }
  }

  isDebugMode () {
    return Boolean(window._debugMode_)
  }
}

var Debug$1 = new Debug();

/* 强制标识当前处于调试模式 */
window._debugMode_ = true;
const debug = Debug$1.create('h5player message:');

/* 劫持localStorage.setItem 方法，增加修改监听功能 */
const orignalLocalStorageSetItem = localStorage.setItem;
localStorage.setItem = function (key, newValue) {
  const setItemEvent = new Event('localStorageSetItemEvent');
  setItemEvent.newValue = newValue;
  setItemEvent.keyName = key;
  window.dispatchEvent(setItemEvent);

  /* 尝试对json对象进行兼容 */
  if (Object.prototype.toString.call(newValue) === '[object Object]') {
    try {
      newValue = JSON.stringify(newValue);
      arguments[1] = newValue;
    } catch (e) {
      console.error(e);
    }
  }

  orignalLocalStorageSetItem.apply(this, arguments);
};

/**
 * 匹配某个URL字段，然后运行对应的callback
 * @param matchItem (String|Array) -必选 要匹配的url字符串
 * @param callback (Function) -必选 要处理的回调方法
 */
function matchAndRun (matchItem, callback, conf) {
  conf = conf || {};

  if (typeof matchItem === 'undefined' || typeof callback !== 'function') {
    console.log('传入的参数不正确');
    return false
  }

  if (conf.disable) {
    return false
  }

  let hasMatchItem = false;
  matchItem = Array.isArray(matchItem) ? matchItem : [matchItem];
  matchItem.forEach((matchStr) => {
    const regEx = new RegExp(matchStr, 'i');
    if (regEx.test(window.location.href)) {
      hasMatchItem = true;
      callback(matchStr, conf);
      if (window !== top) {
        debug.log(`个人脚本规则在ifram里生效：${conf.describe || ''}`, conf);
      } else {
        debug.log(`个人脚本规则生效：${conf.describe || ''}`, conf);
      }
    }
  });

  if (hasMatchItem) {
    monkeyMenu.on(conf.describe || 'no describe', () => {
      alert('当前匹配规则：\n' + JSON.stringify(conf.match, null, 2));
    });
  }
}

/**
 * 任务队列
 * @type {[*]}
 */
const taskMap = [
  {
    match: 'youtube.com',
    describe: '跳过youtube广告',
    run: function () {
      ready('.ytp-ad-skip-button', function (element) {
        element.click();
      });
    }
  },

  {
    match: 'wenxuecity.com',
    describe: '忽略文学城弹框',
    run: function () {
      ready('.wxc-ab-root', function (element) {
        element.parentNode.removeChild(element);
        setInterval(function () {
          document.body.style.position = 'inherit';
        }, 120);
      });
    }
  },

  {
    match: [
      'https://fort.qiweioa.cn/#/login',
      'https://fort.qiweioa.cn/#/desktop'
    ],
    describe: '云匣子自动刷新，防止长时间无操作自动退出登录',
    run: function () {
      const curTime = Date.now();
      const reloadInterval = 10;
      console.log('云匣子自动刷新脚本已注入，刷新频率：' + reloadInterval + '分钟');
      setTimeout(function () {
        window.location.reload();
      }, 1000 * 60 * reloadInterval);

      setInterval(function () {
        console.log('当前页面已运行：' + millisecondToDate(Date.now() - curTime, true));
      }, 1000 * 30);
    }
  },

  {
    match: 'https://fort.qiweioa.cn/connect.html',
    describe: '云匣子控制台自动重连',
    run: function () {
      const curTime = Date.now();
      let reconnectCount = 0;
      setInterval(function () {
        console.log('当前页面已运行：' + millisecondToDate(Date.now() - curTime, true));
        const confirmBtn = document.querySelector('.yab-proxy-messagebox .confirmButtonCls');
        if (confirmBtn && confirmBtn.innerText === '重新连接') {
          confirmBtn.click();
          reconnectCount += 1;
          console.log('控制台已重新连接，重连次数：' + reconnectCount);
        }
      }, 1000 * 30);
    }
  },

  {
    match: 'baidu.com',
    describe: '过滤百度搜索结构的广告',
    disable: true,
    run: function () {
      function delBaiduAd () {
        var resultDom = document.querySelectorAll('#content_left>div');
        console.clear();
        console.log('百度广告过滤', resultDom);
        for (var i = 0; i < resultDom.length; i++) {
          var className = resultDom[i].className;
          if (!/result/.test(className)) {
            resultDom[i].remove();
          }
        }
      }

      delBaiduAd();
      setTimeout(function () {
        delBaiduAd();
      }, 1500);
    }
  },

  {
    match: 'btdx8.com',
    describe: '自动下载比特大雄的bt文件，减少人工点击次数',
    run: function () {
      // 种子文件介绍页
      if (/torrent/.test(window.location.href)) {
        var aimDom = document.querySelectorAll('#zdownload a');
        if (!aimDom || aimDom.length === 0) {
          console.error('当前页面没匹配到种子结果！');
          return false
        }
        if (aimDom.length > 1) {
          for (var i = 0; i < aimDom.length; i++) {
            aimDom[i].click();
          }
        } else {
          // 设置当前页面打开
          aimDom[0].setAttribute('target', '_self');
          aimDom[0].click();
        }
      }

      // 种子文件下载页
      if (/down\.php/.test(window.location.href)) {
        const aimDom = document.querySelectorAll('#down_verify_box .btn-orange');
        if (aimDom && aimDom.length === 1) {
          aimDom[0].click();
          var timeOut = setInterval(function () {
            const downA1 = document.getElementById('downA1');
            if (downA1) {
              var link = downA1.href.trim();
              if (link && link !== 'javascript:;') {
                downA1.setAttribute('target', '_self');
                downA1.click();
                clearTimeout(timeOut);
                setTimeout(function () {
                  window.top.close();
                }, 400);
              }
            }
          }, 550);
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
        const url = element.href;
        const splitStrArr = [
          'links.jianshu.com/go?to=',
          'link.zhihu.com/?target='
        ];

        for (let i = 0; i < splitStrArr.length; i++) {
          const splitStr = splitStrArr[i];
          if (url.includes(splitStr)) {
            const realUrl = decodeURIComponent(url.split(splitStr)[1]);
            element.href = realUrl;
            break
          }
        }
      });
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
        element.click();
        debug.log('检测到烦人的登录提示弹框，已主动为你关闭，如果又误关闭，请提醒作者优化脚本逻辑，或关掉该脚本');
      });
    }
  },

  {
    match: [
      'youtube.com'
    ],
    describe: '记住播放画质',
    run: function () {
      ready(['#player-container .ytp-settings-menu'], element => {
        /* 通过模拟操作获取或设置视频画质 */
        function ytpQuality (quality) {
          const qualityResult = [];
          const settingsMenu = document.querySelector('#player-container .ytp-settings-menu');
          const settingsBtn = document.querySelector('#player-container .ytp-settings-button');
          if (settingsMenu) {
            if (settingsMenu.style.display === 'none') {
              settingsMenu.style.opacity = 0;
              settingsBtn.click();
            }

            const menuitem = settingsMenu.querySelectorAll('.ytp-panel-menu .ytp-menuitem');
            /* 选中最后一项 */
            menuitem[menuitem.length - 1].click();

            const qualityMenuitem = settingsMenu.querySelectorAll('.ytp-quality-menu .ytp-panel-menu .ytp-menuitem');
            qualityMenuitem.forEach(el => {
              const txt = el.innerText;
              if (quality && txt.toLowerCase().startsWith(quality)) {
                el.click();
                console.log('已设置视频画质：' + txt);
              }
              const checked = Boolean(el.getAttribute('aria-checked')) || false;
              qualityResult.push({
                quality: txt,
                checked
              });
            });

            /* 关闭设置面板 */
            setTimeout(function () {
              if (settingsMenu.style.display !== 'none') {
                settingsBtn.click();
              }
              setTimeout(function () {
                settingsMenu.style.opacity = 1;
              }, 600);
            }, 0);
          }

          if (settingsBtn && !qualityResult.length) {
            console.error('未获取到当前视频页面的画质信息');
          }

          return qualityResult
        }

        function getCurYtpQuality () {
          let curQuality = '';
          const qualityList = ytpQuality();
          for (var i = 0; i < qualityList.length; i++) {
            var item = qualityList[i];
            if (item.checked) {
              curQuality = item.quality;
              break
            }
          }
          return curQuality
        }

        function saveCurYtpQuality () {
          const settingsMenu = document.querySelector('#player-container .ytp-settings-menu');
          if (!settingsMenu || settingsMenu.style.display !== 'none' || document.visibilityState !== 'visible') {
            return false
          }

          /* 通过自带控制选项保持播放画质 */
          let localYtpQuality = localStorage.getItem('yt-player-quality');
          const customYtpQuality = localStorage.getItem('_ytpQuality_');

          if (localYtpQuality) {
            localYtpQuality = JSON.parse(localYtpQuality);
            localYtpQuality.expiration = Date.now() + 1000 * 60 * 60 * 24 * 365;
            localStorage.setItem('yt-player-quality', JSON.stringify(localYtpQuality));

            /* 如果当前画质一致则不需要通过模拟操作更新画质 */
            if (customYtpQuality && localYtpQuality.data.endsWith(customYtpQuality.split('p')[0])) {
              return true
            }
          }

          /* 通过模拟画面保持播放画质 */
          const curQuality = getCurYtpQuality();
          if (curQuality && /\d+p/.test(curQuality.toLowerCase())) {
            localStorage.setItem('_ytpQuality_', curQuality);
          }
        }
        /* 自动记录选定的播放画质 */
        setInterval(() => {
          saveCurYtpQuality();
        }, 1000 * 5);

        function setYtpQualityByLocalStorageVal () {
          const customYtpQuality = localStorage.getItem('_ytpQuality_');
          if (customYtpQuality) {
            const quality = customYtpQuality.toLowerCase().split('p')[0] + 'p';
            ytpQuality(quality);
          } else {
            /* 默认设置为1080p画质 */
            ytpQuality('1080p');
            saveCurYtpQuality();
          }
        }
        setYtpQualityByLocalStorageVal();

        /* 视频地址发生改变时重新执行画质设置逻辑 */
        attrObserver(['#player-container video'], () => {
          setYtpQualityByLocalStorageVal();
        }, ['src']);
      });
    }
  }
];

/**
 * 脚本入口
 */
function init () {
  if (!taskMap || taskMap.length === 0) {
    console.log('没有要执行的任务队列！');
    return false
  }
  // 递归处理任务队列
  var taskLen = taskMap.length;
  for (var i = 0; i < taskLen; i++) {
    var item = taskMap[i];
    if (!item.disable) {
      matchAndRun(item.match, item.run, item);
    }
  }
}
init();
