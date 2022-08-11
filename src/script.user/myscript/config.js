import localStorageProxy from 'local-storage-proxy'

const defaultConfig = {
  debugTools: {
    /* 是否启用调试模式的全局标识 */
    debugModeTag: true,

    /* 是否开启eruda，可用于开启反调试的页面上 */
    eruda: false,
    vconsole: false,
    /* 是否启用debugger消除插件 */
    debuggerEraser: false
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
