import ajaxHook from '../../../../src/libs/hookJs/ajaxHook'
const $ = Cypress.$
const $dom = selecter => $(document.querySelectorAll(selecter))

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
    //
  })
})
