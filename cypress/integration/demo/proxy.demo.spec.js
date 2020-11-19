import { proxyHandler, proxyHandlerGenerator } from '../../../src/demo/proxy.demo'

describe('proxy.demo单测', () => {
  before(() => {
    console.log('-------- Before Test --------')
  })
  beforeEach(() => {
    window._debugMode_ = true
  })
  afterEach(() => {
    cy.clearCookies()
  })

  it('基本调用', () => {
    const win = new Proxy(window, proxyHandler)
    const win2 = new Proxy(window, proxyHandlerGenerator())
    // expect(win.alert).to.not.equal(win2.alert)

    var xhr = new Proxy(XMLHttpRequest, proxyHandlerGenerator())

    var xhr = new xhr()

    // win.alert(111)
    // win2.console.log(222)
    // win2.bb = 111
    // delete win2.bb
  })
})
