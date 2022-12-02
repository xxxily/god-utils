/*!
 * @name         rollup.tree.config.js
 * @description  rollup 打包配置列表
 * @version      0.0.1
 * @author       Blaze
 * @date         24/04/2019 14:20
 * @github       https://github.com/xxxily
 */
const path = require('path')
const resolve = p => {
  return path.resolve(__dirname, '../', p)
}

const confTree = {
  myscript: {
    version: '0.0.1',
    description: 'myscript',
    input: resolve('src/script.user/myscript/index.js'),
    output: {
      file: resolve('dist/script.user/myscript.user.js'),
      format: 'es', // 可选值： amd, cjs, es, iife, umd
      name: 'myscript'
    }
  },
  myscript02: {
    version: '0.0.1',
    description: 'myscript02',
    input: resolve('src/script.user/myscript02/index.js'),
    output: {
      file: resolve('dist/script.user/myscript02.user.js'),
      format: 'es',
      name: 'myscript02'
    }
  },
  quicklink: {
    version: '2.3.0',
    description: 'quicklink',
    input: resolve('src/script.user/quicklink/index.js'),
    output: {
      file: resolve('dist/script.user/quicklink.user.js'),
      format: 'es',
      name: 'quicklink'
    }
  },
  sw: {
    version: '0.0.1',
    description: 'Service Workers Demo',
    input: resolve('src/demo/sw.demo.js'),
    output: {
      file: resolve('dist/demo/sw.demo.js'),
      format: 'es', // 可选值： amd, cjs, es, iife, umd
      name: 'sw'
    }
  }
}

module.exports = confTree
