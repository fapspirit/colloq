const { expect } = require('chai')
const Colloq = require('../lib')

describe('Smoke', () => {
  it('works', async () => {
    const server = new Colloq('token')
    expect(server).not.to.equals(undefined)
  })
})
