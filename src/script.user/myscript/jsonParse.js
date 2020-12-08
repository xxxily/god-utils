/* 防止解析出错的jsonParse */
function jsonParse (str) {
  let result = null
  try {
    result = JSON.parse(str)
  } catch (e) {
    result = {}
    console.error(e)
  }
  result = result || {}
  return result
}

export default jsonParse
