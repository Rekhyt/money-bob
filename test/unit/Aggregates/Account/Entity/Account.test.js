const assert = require('assert')
const { ValidationError } = require('ddd-js')
const Account = require('../../../../../src/Aggregates/Account/Entity/Account')
const AccountName = require('../../../../../src/Aggregates/Account/ValueObject/AccountName')
const Tag = require('../../../../../src/Aggregates/Account/ValueObject/Tag')

const AccountImpl = class extends Account {}

describe('Account', () => {
  let subjectUnderTest

  beforeEach(() => {
    subjectUnderTest = new AccountImpl(new AccountName('test'))
  })

  describe('validateMetadataFieldsExisting()', () => {
    it('should throw an error if a required metadata field is missing', () => {
      assert.throws(
        () => Account.validateMetadataFieldsExisting(
          ['requiredField'],
          { someNonsenseField: 'containing nonsense' }),
        ValidationError
      )
    })

    it('should return if all required metadata fields are present', () => {
      Account.validateMetadataFieldsExisting(
        ['requiredField1', 'requiredField2'],
        { requiredField1: 'Joe', requiredField2: 'Bob' }
      )
    })
  })

  describe('equals()', () => {
    it('should be equal to another instance of the same type that has the same name', () => {
      assert.ok(subjectUnderTest.equals(new AccountImpl(new AccountName('test'))))
    })

    it('should not be equal to another instance of a different type', () => {
      assert.ok(!subjectUnderTest.equals({ name: () => new AccountName('test') }))
    })

    it('should not be equal to another instance of the same type that has a different name', () => {
      assert.ok(!subjectUnderTest.equals(new AccountImpl(new AccountName('test123'))))
    })
  })

  describe('addTags()', () => {
    it('should add a number of tags to the list of existing tags', () => {
      const expectedTags = [
        new Tag('tag1'),
        new Tag('tag2'),
        new Tag('tag3')
      ]

      subjectUnderTest.addTags(expectedTags)

      expectedTags.forEach(tag => {
        assert.ok(subjectUnderTest.tags.find(sutTag => sutTag.equals(tag)))
      })
    })

    it('should skip (aka do not add twice) already existing tags', () => {
      const initialTags = [
        new Tag('tag1'),
        new Tag('tag2')
      ]

      const addedTags = [
        new Tag('tag3'),
        new Tag('tag4'),
        new Tag('tag2')
      ]

      const expectedTags = [
        new Tag('tag1'),
        new Tag('tag2'),
        new Tag('tag3'),
        new Tag('tag4')
      ]

      subjectUnderTest.addTags(initialTags)
      subjectUnderTest.addTags(addedTags)

      expectedTags.forEach(tag => {
        assert.strictEqual(subjectUnderTest.tags.filter(sutTag => sutTag.equals(tag)).length, 1)
      })
    })
  })
})
