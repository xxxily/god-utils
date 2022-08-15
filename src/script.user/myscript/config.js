import localStorageProxy from 'local-storage-proxy'

const defaultConfig = {
  debugTools: {
    /* 是否启用调试模式的全局标识 */
    debugModeTag: true,

    /* 是否开启eruda，可用于开启反调试的页面上 */
    eruda: false,
    vconsole: false,
    /* 是否启用debugger消除插件 */
    debuggerEraser: true,

    /* 代理console，防止console下的方法被重写后，而无法输出调试信息 */
    consoleProxy: true,

    /* 时间管理器插件配置 */
    timerManager: {
      enabled: false,
      /* 当使用clearTimer的相关方法取消定时器时，是否继续保留计时器的相关信息 */
      keepTimerState: true,
      /* 阻断所有setInterval、setTimeout的调用 */
      blockAll: false,
      /* 阻断上一次执行时长超过150ms的setInterval、setTimeout调用 */
      blockLongTask: true,
      /* 修改计时器的比率，使其执行时间变快或变慢 */
      rate: 1
    }
  },
  enhanceTools: {
    /* 是否开启水印擦除插件 */
    waterMarkEraser: true
  }
}

const config = localStorageProxy('_myscriptConfig_', {
  defaults: defaultConfig,
  lspReset: false,
  storageEventListener: false
})

export default config
