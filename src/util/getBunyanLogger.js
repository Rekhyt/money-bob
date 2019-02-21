// istanbul ignore file
const bunyan = require('bunyan')

/**
 * @param {string} appName
 * @returns {Logger}
 */
module.exports = appName => bunyan.createLogger({ name: appName })
