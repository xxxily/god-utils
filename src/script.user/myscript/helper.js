import debug from './debug'
import { loadScript } from '../../libs/utils'

export function initEruda () {
  if (!window.eruda) {
    loadScript('https://cdn.jsdelivr.net/npm/eruda@2.5.0/eruda.min.js', () => {
      if (window.eruda) {
        window.eruda.init()
      } else {
        debug.error('eruda init failed')
      }
    })
  } else {
    window.eruda.init()
  }
}

export function initVconsole () {
  if (!window.VConsole) {
    loadScript('https://cdn.jsdelivr.net/npm/vconsole@3.14.6/dist/vconsole.min.js', () => {
      if (window.VConsole) {
        // eslint-disable-next-line no-new
        new window.VConsole()
      } else {
        debug.error('vconsole init failed')
      }
    })
  } else {
    // eslint-disable-next-line no-new
    new window.VConsole()
  }
}
