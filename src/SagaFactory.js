const BookTransaction = require('./Saga/BookTransaction')

class SagaFactory {
  /**
   * @param {Logger} logger
   * @param {CommandDispatcher} commandDispatcher
   */
  constructor (logger, commandDispatcher) {
    this._logger = logger
    this._commandDispatcher = commandDispatcher
  }

  /**
   * @return {BookTransaction}
   */
  createBookTransaction () {
    return this._createSaga(BookTransaction)
  }

  /**
   * @param {Class} constructor
   * @param {*} args
   * @returns {*}
   * @private
   */
  _createSaga (constructor, ...args) {
    return new constructor(...[this._logger, this._commandDispatcher, ...args])
  }
}

module.exports = SagaFactory
