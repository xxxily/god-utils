window.myTools_ = {
  /* 字符去敏感化操作 */
  insensitivity: function (str) {
    if (typeof str === 'undefined') {
      console.log('请输入字符串内容')
      return false
    }

    /* 生成某个范围内的随机数 */
    function randomFrom (lowerValue, upperValue) {
      return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue)
    }

    /* 检查某个字符串是否是在中文字符集里面的 */
    function isCJK (str) {
      var CJKBegin = '一'.charCodeAt(0)
      var CJKEnd = '龥'.charCodeAt(0)
      var charCode = str.charCodeAt(0)
      if (charCode >= CJKBegin && charCode <= CJKEnd) {
        return true
      } else {
        return false
      }
    }

    const splitStr = ['#', '$', '%', '|', ',', '-', '=', '`']
    const tmpArr = []
    /* 进行字符串随机插入分隔符操作 */
    for (var i = 0; i < str.length; i++) {
      var item = str[i]
      tmpArr.push(item)

      if (!splitStr.includes(item) && isCJK(item) && i < str.length - 1) {
        /* 随机插入一个分隔符 */
        tmpArr.push(splitStr[randomFrom(0, splitStr.length - 1)])
      }
    }

    const result = tmpArr.join('')
    console.log(result)
    return result
  }
}
