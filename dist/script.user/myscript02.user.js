// ==UserScript==
// @name         个人定制脚本 - 无沙箱版
// @namespace    http://xxxily.co
// @version      0.0.1
// @license      LGPLv3
// @description  个人专用脚本
// @author       Blaze
// @match        *://*/*
// @match        http://*/*
// @match        https://*/*
// @grant        none
// @license      GPL
// @run-at       document-start
// ==/UserScript==
(function (w) { if (w) { w.name = 'myscript-none-sandbox'; } })();

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
const isArr = obj => isType(obj, 'array');
const isRegExp = obj => isType(obj, 'regexp');
const isFunction = obj => obj instanceof Function;

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

    const handler = function () {
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
    };

    /**
     * 调试复杂数据的辅助函数
     * 例如将vue的data对象转换回普通对象数据进行输出
     * 又例如将本身可以解析为对象的字符串转成普通对象数据进行输出
     */
    handler.parse = function () {
      const arg = Array.from(arguments);
      arg.forEach((val, index) => {
        if (val) {
          if (val.__ob__ || isObj(val) || isArr(val)) {
            try {
              arg[index] = JSON.parse(JSON.stringify(val));
            } catch (e) {
              arg[index] = val;
            }
          } else if (typeof val === 'string') {
            const tmpObj = JSON.parse(JSON.stringify(val));
            if (isObj(tmpObj) || isArr(tmpObj)) {
              arg[index] = tmpObj;
            }
          }
        }
      });
      handler.apply(handler, arg);
    };

    return handler
  }

  isDebugMode () {
    return Boolean(window._debugMode_)
  }
}

var Debug$1 = new Debug();

// import { proxy } from './xhrHook'

function fetchHook (callback) {
  // const fetchHookList = window._fetchHookList || []
  // window._fetchHookList = fetchHookList

  if (window._realFetch) {
    return true
  }

  window._realFetch = window.fetch;

  window.fetch = async function () {
    if (callback instanceof Function) {
      try {
        const hookResult = callback(arguments);

        // 阻止请求
        if (hookResult === false) {
          // console.info('[fetchHook block]', arguments)
          return false
        }
      } catch (e) {
        console.error('[fetchHook error]', e);
      }
    }

    return window._realFetch.apply(window, arguments)
  };
}

function xhrHook (callback) {
  if (window._realXhr) {
    return true
  }

  window._realXhr = window.XMLHttpRequest;

  window.XMLHttpRequest = function () {
    const xhr = new window._realXhr();

    const xhrConf = {};

    const realOpen = xhr.open;
    xhr.open = function () {
      xhrConf.method = arguments[0];
      xhrConf.url = arguments[1];
      xhrConf.async = arguments[2];
      xhrConf.user = arguments[3];
      xhrConf.password = arguments[4];

      return realOpen.apply(xhr, arguments)
    };

    const realSend = xhr.send;
    xhr.send = function () {
      if (callback instanceof Function) {
        const result = callback(xhrConf);

        // 阻止请求
        if (result === false) {
          // console.info('[xhrHook block]', arguments)
          return false
        }
      }

      return realSend.apply(xhr, arguments)
    };

    // xhr.addEventListener('error', function (err) {
    //   console.error('[xhrHook error]', err)
    // }, true)

    this.xhr = xhr;

    return xhr
  };
}

const blockList = [];

function getBlockList () {
  return JSON.parse(JSON.stringify(blockList))
}

/**
 * 判断某个url地址是否需要被拦截掉
 * @param {URL} url -必选，要判断的URL地址
 */
function isNeedBlock (url) {
  let needBlock = false;

  if (!url) {
    return needBlock
  }

  for (let i = 0; i < blockList.length; i++) {
    const rule = blockList[i];
    if (typeof rule === 'string') {
      if (url.includes(rule)) {
        needBlock = true;
        break
      }
    } else if (isRegExp(rule) && rule.test(url)) {
      needBlock = true;
      break
    }
  }

  return needBlock
}

/**
 * 判断是否存在某条规则
 * @param {String|RegExp} rule
 * @returns {Boolean}
 */
function hasRule (rule) {
  let hasRule = false;
  for (let i = 0; i < blockList.length; i++) {
    if (rule === blockList[i]) {
      hasRule = true;
      break
    }
  }
  return hasRule
}

/**
 * 增加拦截规则
 * @param {String|RegExp} rule
 * @returns
 */
function add (rule) {
  if (!rule || hasRule(rule)) {
    return false
  } else {
    blockList.push(rule);
    return true
  }
}

// 对请求方法进行hook操作
// hook({
//   open: function (args, xhr) {
//     const url = args[1]
//     if (isNeedBlock(url)) {
//       return false
//     }
//   }
// })

fetchHook(function (args) {
  const url = args[0];

  // console.info('[fetchHook noBlock]', url)

  if (isNeedBlock(url)) {
    // console.info('[fetchHook block]', args)
    return false
  }
});

xhrHook(function (config) {
  const url = config.url;
  if (isNeedBlock(url)) {
    console.error('[xhrHook block]', url);
    return false
  }
});

// proxy({
//   onRequest: (config, handler) => {
//     if (!isNeedBlock(config.url)) {
//       handler.next(config)
//     } else {
//       console.error('[xhrHook block]', config)
//     }
//   }
// })

/*!
 * @name         qqDocsBlocker.mod.js
 * @description  腾讯文档无脑上报请求拦截器
 * @version      0.0.1
 * @author       Blaze
 * @date         2021/12/23 15:08
 * @github       https://github.com/xxxily
 */
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
    ];
    blockList.forEach(rule => { add(rule); });
    console.log('腾讯文档无脑上报请求拦截器:', JSON.stringify(getBlockList()));
  }
};

var qqDocsBlockerMod = {
  setup (addTaskMap) {
    addTaskMap(taskConf);

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
};

const modList = [
  qqDocsBlockerMod
];

/* 强制标识当前处于调试模式 */
window._debugMode_ = true;
const debug = Debug$1.create('myscript02 message:');

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
const taskMap = [];

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
function init () {
  /* 注册相关模块 */
  moduleSetup(modList);

  /* 运行任务队列 */
  runTaskMap(taskMap);
}
init();
