import {
  deepClone01,
  deepClone02,
  deepClone03,
  deepClone04
} from '../../../src/demo/deepClone.demo'
import { execDuration } from '../cyUtils'

describe('deepClone 测试', () => {
  before(() => {
    console.log('-------- Before Test --------')
  })
  beforeEach(() => {

  })
  afterEach(() => {

  })

  it('deepClone01', () => {
    const data = {
      a: 1
    }

    expect(function () { deepClone01(data) }).not.throw()

    /* deepClone01不支持循环引用 */
    data.f = data

    expect(function () { deepClone01(data) }).to.throw()
  })

  it('deepClone02', () => {
    const data = {
      a: 1
    }
    data.f = data

    expect(function () { deepClone02(data) }).not.throw()

    const data2 = deepClone02(data)
    expect(data).to.not.equal(data2)
    expect(data.f).to.eql(data)
    expect(data2.f).to.eql(data2)
    expect(data.f).to.not.equal(data2.f)
  })

  it('compare deepClone02 deepClone03 and deepClone04', () => {
    const arr = []
    for (let i = 0; i < 1000000; i++) {
      arr.push(i)
    }
    const data = {
      a: arr
    }
    console.time('deepClone02')
    const result = deepClone02(data)
    console.timeEnd('deepClone02')
    console.log(result)

    console.time('deepClone03')
    const result1 = deepClone03(data)
    console.timeEnd('deepClone03')
    console.log(result1)

    console.time('deepClone04')
    const result2 = deepClone04(data)
    console.timeEnd('deepClone04')
    console.log(result2)

    const duration02 = execDuration(function () { deepClone02(data) })
    const duration03 = execDuration(function () { deepClone03(data) })
    const duration04 = execDuration(function () { deepClone04(data) })
    console.log(duration02, duration03)
    expect(duration02).to.above(duration03)
    expect(duration02).to.above(duration04)
  })

  it('deepClone04', () => {
    const data = {
      a: 1,
      b: 2,
      c: function () {},
      d: new Date(),
      e: new Map(),
      f: new Set(),
      g: /[a-zA-Z]/
    }

    const data2 = deepClone04(data)
    console.log(data2, deepClone03(data))
  })
})
