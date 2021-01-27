const path = require('path')
const { Runner } = require('ddd-js')

const AccountList = require('./Aggregates/Account/Entity/AccountList')
const TransactionList = require('./Aggregates/Transaction/Entity/TransactionList')
const BookTransaction = require('./Saga/BookTransaction')
const AccountListReadModel = require('./ReadModel/AccountList')
const AccountTreeReadModel = require('./ReadModel/AccountTree')

const logger = require('./util/getBunyanLogger')('money-bob')

Runner.createWithExpress(logger, path.join(__dirname, '..', 'datasources', 'events.json'))
  .attachRootEntity(AccountList)
  .attachRootEntity(TransactionList)
  .attachSaga(BookTransaction)
  .attachReadModel('/accounts', AccountListReadModel, 'accounts')
  .attachReadModel('/accountTree', AccountTreeReadModel, 'accounts')
  .replayHistory().then(runner => runner.startServer(8000))
