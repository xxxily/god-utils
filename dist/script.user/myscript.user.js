// ==UserScript==
// @name         个人定制脚本
// @namespace    http://xxxily.co
// @version      0.1.1
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

/*!
 * @name         utils.js
 * @description  数据类型相关的方法
 * @version      0.0.1
 * @author       Blaze
 * @date         22/03/2019 22:46
 * @github       https://github.com/xxxily
 */

/**
 * 准确地获取对象的具体类型 参见：https://www.talkingcoder.com/article/6333557442705696719
 * @param obj { all } -必选 要判断的对象
 * @returns {*} 返回判断的具体类型
 */
function getType (obj) {
  if (obj == null) {
    return String(obj)
  }
  return typeof obj === 'object' || typeof obj === 'function'
    ? (obj.constructor && obj.constructor.name && obj.constructor.name.toLowerCase()) ||
    /function\s(.+?)\(/.exec(obj.constructor)[1].toLowerCase()
    : typeof obj
}

const isType = (obj, typeName) => getType(obj) === typeName;
const isObj = obj => isType(obj, 'object');
const isFunction = obj => obj instanceof Function;

/*!
 * @name         url.js
 * @description  用于对url进行解析的相关方法
 * @version      0.0.1
 * @author       Blaze
 * @date         27/03/2019 15:52
 * @github       https://github.com/xxxily
 */

/**
 * 参考示例：
 * https://segmentfault.com/a/1190000006215495
 * 注意：该方法必须依赖浏览器的DOM对象
 */

function parseURL (url) {
  const a = document.createElement('a');
  a.href = url || window.location.href;
  return {
    source: url,
    protocol: a.protocol.replace(':', ''),
    host: a.hostname,
    port: a.port,
    origin: a.origin,
    search: a.search,
    query: a.search,
    file: (a.pathname.match(/\/([^/?#]+)$/i) || ['', ''])[1],
    hash: a.hash.replace('#', ''),
    path: a.pathname.replace(/^([^/])/, '/$1'),
    relative: (a.href.match(/tps?:\/\/[^/]+(.+)/) || ['', ''])[1],
    params: (function () {
      const ret = {};
      const seg = [];
      const paramArr = a.search.replace(/^\?/, '').split('&');

      for (let i = 0; i < paramArr.length; i++) {
        const item = paramArr[i];
        if (item !== '' && item.indexOf('=')) {
          seg.push(item);
        }
      }

      for (let j = 0; j < seg.length; j++) {
        const param = seg[j];
        const idx = param.indexOf('=');
        const key = param.substring(0, idx);
        const val = param.substring(idx + 1);
        if (!key) {
          ret[val] = null;
        } else {
          ret[key] = val;
        }
      }
      return ret
    })()
  }
}

/**
 * 简单的复制内容到剪贴板方法
 * @param text {String} -必选 要复制到剪贴板的内容
 * @returns {boolean} 复制成功或失败的状态
 */

function copyText (text = '') {
  let sucStatus = false;
  const input = document.createElement('input');

  input.setAttribute('readonly', 'readonly');
  input.setAttribute('value', text);
  document.body.appendChild(input);

  input.setSelectionRange(0, input.value.length);
  input.select();

  if (document.execCommand && document.execCommand('copy')) {
    document.execCommand('copy');
    sucStatus = true;
  }

  document.body.removeChild(input);

  return sucStatus
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

/* 防止解析出错的jsonParse */
function jsonParse (str) {
  let result = null;
  try {
    result = JSON.parse(str);
  } catch (e) {
    result = {};
    console.error(e);
  }
  result = result || {};
  return result
}

/**
 * 由于tampermonkey对window对象进行了封装，我们实际访问到的window并非页面真实的window
 * 这就导致了如果我们需要将某些对象挂载到页面的window进行调试的时候就无法挂载了
 * 所以必须使用特殊手段才能访问到页面真实的window对象，于是就有了下面这个函数
 * @returns {Promise<void>}
 */
async function getPageWindow () {
  return new Promise(function (resolve, reject) {
    if (window._pageWindow) {
      return resolve(window._pageWindow)
    }

    const listenEventList = ['load', 'mousemove', 'scroll', 'get-page-window-event'];

    function getWin (event) {
      window._pageWindow = this;
      // debug.log('getPageWindow succeed', event)
      listenEventList.forEach(eventType => {
        window.removeEventListener(eventType, getWin, true);
      });
      resolve(window._pageWindow);
    }

    listenEventList.forEach(eventType => {
      window.addEventListener(eventType, getWin, true);
    });

    /* 自行派发事件以便用最短的时候获得pageWindow对象 */
    window.dispatchEvent(new window.Event('get-page-window-event'));
  })
}
getPageWindow();

/*!
 * @name         autoRefresh.js
 * @description  自动刷新页面
 * @version      0.0.1
 * @author       Blaze
 * @date         2020/12/8 10:33
 * @github       https://github.com/xxxily
 */

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

  const conf = jsonParse(localStorage.getItem('_autoRefreshConfig_'));
  const urlId = encodeURIComponent(location.href);

  if (timeout === -1) {
    /* 取消页面自动刷新 */
    delete conf[urlId];
    localStorage.setItem('_autoRefreshConfig_', JSON.stringify(conf));
    clearTimeout(window._autoRefreshTimer_);
    alert('自动刷新取消成功~');
    return true
  } else if (typeof timeout === 'number') {
    /* 设置自动刷新 */
    conf[urlId] = {
      timeout,
      refreshCount: 0,
      selector: selector || ''
    };
    localStorage.setItem('_autoRefreshConfig_', JSON.stringify(conf));
    clearTimeout(window._autoRefreshTimer_);
  }

  /* 执行自动刷新 */
  if (conf[urlId] && conf[urlId].timeout) {
    let selectorReady = false;
    if (conf[urlId].selector) {
      ready(conf[urlId].selector, () => {
        selectorReady = true;
      });
    }

    window._autoRefreshTimer_ = setTimeout(async function () {
      if (selectorReady === true) {
        return true
      }

      conf[urlId].refreshCount += 1;
      localStorage.setItem('_autoRefreshConfig_', JSON.stringify(conf));
      window.location.reload();
    }, conf[urlId].timeout);
  }
}

/* 增加自动刷新功能的可视化操作按钮 */
monkeyMenu.on('自动刷新页面', () => {
  let timeout = prompt('设置刷新间隔/单位秒（-1表示取消刷新）', 10);
  timeout = Number(timeout);

  if (Number.isNaN(timeout)) {
    alert('请输入正确的时间间隔');
    return false
  }

  if (timeout >= 0) {
    autoRefresh(timeout * 1000);
  } else {
    autoRefresh(timeout);
  }
});

var autoRefreshMod = {
  autoRefresh: autoRefresh,
  async setup () {
    const win = await getPageWindow();
    win._autoRefresh_ = autoRefresh;

    /* 每个页面都要检查是否需要执行自动刷新逻辑 */
    autoRefresh();
  }
};

/*!
 * @name         showPassword.mod.js
 * @description  显示当前页面密码的模块
 * @version      0.0.1
 * @author       Blaze
 * @date         2020/12/8 11:02
 * @github       https://github.com/xxxily
 */

let hasInit = false;
function init (el) {
  /* 支持直接复制密码域下的密码 */
  el.addEventListener('keydown', event => {
    if (event.ctrlKey && event.keyCode === 67) {
      setTimeout(() => { copyText(event.target.value); }, 100);
    }
  });

  if (hasInit) return
  hasInit = true;

  monkeyMenu.on('查看密码域内容', () => {
    const pwdEls = document.querySelectorAll('input[type="password"]');
    const pwdArr = [];

    pwdEls.forEach(pwdEl => {
      window.prompt('密码域内容：', pwdEl.value);
      copyText(pwdEl.value);
      pwdArr.push({
        el: pwdEl,
        pwd: pwdEl.value
      });
    });

    console.log('当前页面密码信息：', pwdArr);
  });
}

var showPasswordMod = {
  async setup () {
    ready('input[type="password"]', (el) => {
      init(el);
    });
  }
};

/*!
 * @name         keepPlayerQuality.mod.js
 * @description  锁定视频播放画质
 * @version      0.0.1
 * @author       Blaze
 * @date         2021/1/5 11:00
 * @github       https://github.com/xxxily
 */

function keepYoutubeQuality () {
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
      for (let i = 0; i < qualityList.length; i++) {
        const item = qualityList[i];
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
    let pageUrl = location.href;
    attrObserver(['#player-container video'], () => {
      if (pageUrl !== location.href) {
        pageUrl = location.href;
        setYtpQualityByLocalStorageVal();
      }
    }, ['src']);
  });
}

const taskConf = {
  match: [
    'youtube.com'
  ],
  describe: '记住播放画质',
  run: function () {
    /* 目前只适配了油管 */
    keepYoutubeQuality();
  }
};

var keepPlayerQualityMod = {
  setup (addTaskMap) {
    addTaskMap(taskConf);
  }
};

/*!
 * @name         superparse.mod.js
 * @description  在线视频下载解析
 * @version      0.0.1
 * @author       Blaze
 * @date         2021/1/5 9:59
 * @github       https://github.com/xxxily
 */

const taskConf$1 = {
  match: [
    'superparse.com'
  ],
  describe: '解析视频下载地址',
  run: function () {
    const urlInfo = parseURL(window.top.location.href);
    if (!urlInfo.params.url) {
      return false
    }

    ready('input.form-control', function (el) {
      el.value = decodeURIComponent(urlInfo.params.url);
      document.querySelector('.input-group-btn button').click();
    });
  }
};

function addParseBtn () {
  if (location.host === 'superparse.com') {
    return false
  }

  // const supportHost = [
  //   'twitter.com',
  //   'youtube.com'
  // ]

  monkeyMenu.on('使用superparse解析视频地址', () => {
    const url = encodeURIComponent(window.top.location.href);
    if (window.GM_openInTab) {
      window.GM_openInTab('https://superparse.com/zh?url=' + url, true);
    }
  });
}

var superparseMod = {
  setup (addTaskMap) {
    addTaskMap(taskConf$1);
    addParseBtn();
  }
};

const modList = [
  autoRefreshMod,
  showPasswordMod,
  keepPlayerQualityMod,
  // searchEnhanceMod,
  superparseMod
];

/* 强制标识当前处于调试模式 */
window._debugMode_ = true;
const debug = Debug$1.create('myscript message:');

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
    describe: '自动跳过youtube广告',
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
        const resultDom = document.querySelectorAll('#content_left>div');
        console.clear();
        console.log('百度广告过滤', resultDom);
        for (let i = 0; i < resultDom.length; i++) {
          const className = resultDom[i].className;
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
        const aimDom = document.querySelectorAll('#zdownload a');
        if (!aimDom || aimDom.length === 0) {
          console.error('当前页面没匹配到种子结果！');
          return false
        }
        if (aimDom.length > 1) {
          for (let i = 0; i < aimDom.length; i++) {
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
          const timeOut = setInterval(function () {
            const downA1 = document.getElementById('downA1');
            if (downA1) {
              const link = downA1.href.trim();
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
  }
];

/* 添加任务配置到TaskMap */
function addTaskMap (taskConfList) {
  taskConfList = Array.isArray(taskConfList) ? taskConfList : [taskConfList];
  taskConfList.forEach(taskConf => {
    if (isObj(taskConf) && taskConf.match && isFunction(taskConf.run)) {
      taskMap.push(taskConf);
    }
  });
}

function runTaskMap (taskMap) {
  if (!taskMap || taskMap.length === 0) {
    console.log('没有要执行的任务队列！');
    return false
  }

  // 递归处理任务队列
  const taskLen = taskMap.length;
  for (let i = 0; i < taskLen; i++) {
    const item = taskMap[i];
    if (!item.disable) {
      matchAndRun(item.match, item.run, item);
    }
  }
}

function moduleSetup (mods) {
  if (!mods) return false

  mods = Array.isArray(mods) ? mods : [mods];
  mods.forEach(modItem => {
    if (modItem && isFunction(modItem.setup)) {
      if (modItem._isSetup_) return false

      modItem.setup(addTaskMap);
      modItem._isSetup_ = true;
    } else {
      debug.error('模块安装失败！', modItem);
    }
  });
}

/**
 * 脚本入口
 */
function init$1 () {
  /* 注册相关模块 */
  moduleSetup(modList);

  /* 运行任务队列 */
  runTaskMap(taskMap);
}
init$1();
