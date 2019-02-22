require('./env')
const { bot } = require('./core/bot')
require('./commands')(bot)
require('./actions')(bot)
