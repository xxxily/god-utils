import ready from '../../../../src/libs/utils/ready'
const $ = Cypress.$
const $dom = selecter => $(document.querySelectorAll(selecter))

/* 模拟插入div节点 */
function appendDiv (className) {
  className = Array.isArray(className) ? className : [className]
  const strArr = []
  className.forEach(name => {
    strArr.push(`<div class="${name}">${name}</div>`)
  })
  $dom('body').append(strArr.join(''))
}

describe('ready单测', () => {
  before(() => {
    console.log('-------- Before Test --------')
  })
  beforeEach(() => {
    $dom('body').html('')
  })
  afterEach(() => {
    $dom('body').html('')
    cy.clearCookies()
  })

  it('基本调用', () => {
    let isReady = false

    ready('div.test1', () => {
      isReady = true
    })

    cy.get('div.test1').should(el => {
      expect(isReady).to.equal(true)
    })

    appendDiv(['test1'])
  })

  it('数组传参', () => {
    let isReady = 0

    ready(['div.test2', 'div.test3'], () => {
      isReady += 1
    })

    cy.get('div.test2').should(el => {
      expect(isReady).to.equal(2)
    })

    appendDiv(['test2', 'test3'])
  })

  it('重复调用', () => {
    let isReady = 0

    ready('div.test4', () => {
      isReady += 1
    })

    ready('div.test4', () => {
      isReady += 1
    })

    cy.get('div.test4').should(el => {
      expect(isReady).to.equal(2)
    })

    appendDiv(['test4'])
  })

  it('shadow DOM支持', () => {
    $dom('body').append('<div id="test5">test5</div>')
    const el = document.querySelector('#test5')
    const shadowRoot = el.attachShadow({ mode: 'open' })

    let isReady = 0

    ready('div.shadow1', () => {
      isReady += 1
    }, shadowRoot)

    cy.get('.test5').should(el => {
      expect(isReady).to.equal(1)
    })

    const div = document.createElement('div')
    div.className = 'shadow1'
    shadowRoot.appendChild(div)
  })
})
