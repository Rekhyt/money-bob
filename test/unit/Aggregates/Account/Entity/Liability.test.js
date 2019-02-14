const assert = require('assert')
const { ValidationError } = require('ddd-js')
const Liability = require('../../../../../src/Aggregates/Account/Entity/Liability')
const AccountName = require('../../../../../src/Aggregates/Account/ValueObject/AccountName')

describe('Liability', () => {
  describe('tryCreate()', () => {
    it('should throw an error if a required metadata field is missing', () => {
      // noinspection JSCheckFunctionSignatures
      assert.throws(
        () => Liability.tryCreate(new AccountName('test'), { someNonsenseField: 'containing nonsense' }),
        ValidationError
      )
    })

    it('should create the object when all required fields are present', () => {
      const expectedAccountName = new AccountName('test')
      const expectedMetadata = { debitorName: 'Joe' }

      const entity = Liability.tryCreate(expectedAccountName, expectedMetadata)

      assert(entity instanceof Liability)
      assert.ok(entity.name.equals(expectedAccountName))
      assert.strictEqual(entity.debitorName.getValue(), expectedMetadata.debitorName)
    })
  })
})
