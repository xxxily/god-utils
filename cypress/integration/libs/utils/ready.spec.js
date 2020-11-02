import ready from '../../../../src/libs/utils/ready'
const $ = Cypress.$
const $dom = selecter => $(document.querySelectorAll(selecter))

describe('ready单测', () => {
  before(done => {
    console.log('-------- Before Test --------')
    done()
  })
  beforeEach(done => {
    $dom('body').html('')
    done()
  })
  afterEach(done => {
    $dom('body').html('')
    cy.clearCookies()
    done()
  })

  it('基本调用', () => {
    let isReady = false

    ready('div.test1', () => {
      isReady = true
    })

    cy.get('div.test1').should(el => {
      expect(isReady).to.equal(true)
    })

    $dom('body').append('<div class="test1">test1</div>')
  })

  it('数组传参', () => {
    let isReady = 0

    ready(['div.test2', 'div.test3'], () => {
      isReady += 1
    })

    cy.get('div.test2').should(el => {
      expect(isReady).to.equal(2)
    })

    $dom('body').append('<div class="test2">test2</div><div class="test3">test3</div>')
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

    $dom('body').append('<div class="test4">test4</div>')
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
