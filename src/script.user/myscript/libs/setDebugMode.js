/*!
 * @name         setDebugMode.js
 * @description  标识当前处于调试模式
 * @version      0.0.1
 * @author       xxxily
 * @date         2022/08/11 14:47
 * @github       https://github.com/xxxily
 */

import { getPageWindowSync } from '../../common/getPageWindow'

export default function setDebugMode () {
  /* 让脚本可以输出调试信息 */
  window._debugMode_ = true

  const pageWindow = getPageWindowSync()

  /* 标识当前处于调试模式 */
  pageWindow.__debugMode__ = true
  pageWindow._debugMode_ = true

  /* 开发环境运行标识，只对遵循该标识的逻辑生效 */
  pageWindow._isDevEnv_ = true

  /* 允许进行Mock标识，只对遵循该标识的逻辑生效 */
  pageWindow._isAllowMock_ = true
}
