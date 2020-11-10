import ajaxHook from '../../../../src/libs/hookJs/ajaxHook'
import hookJs from '../../../../src/libs/hookJs'
const $ = Cypress.$
const $dom = selecter => $(document.querySelectorAll(selecter))
const toStr = Function.prototype.call.bind(Object.prototype.toString)
const isObj = obj => toStr(obj) === '[object Object]'
const isFn = obj => obj instanceof Function

function getAllKeys (obj) {
  const tmpArr = []
  for (const key in obj) { tmpArr.push(key) }
  const allKeys = Array.from(new Set(tmpArr.concat(Reflect.ownKeys(obj))))
  return allKeys
}

describe('ajaxHook单测', () => {
  before(() => {
    console.log('-------- Before Test --------')
  })
  beforeEach(() => {
    window._debugMode_ = true
    $dom('body').html('')
  })
  afterEach(() => {
    $dom('body').html('')
    cy.clearCookies()
  })

  it('基本调用', () => {
    const hookSuc = false

    hookJs.hookClass(window, 'XMLHttpRequest', {
      get () {},
      set () {},
      has () {},
      deleteProperty () {},
      ownKeys () {},
      getOwnPropertyDescriptor () {},
      defineProperty () {},
      preventExtensions () {},
      getPrototypeOf () {},
      isExtensible () {},
      setPrototypeOf () {},
      apply () {},
      construct () {}
    })

    expect(hookSuc).to.equal(true)
  })
})
