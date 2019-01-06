module.exports = bot => {
  // require('./about')(bot)
  require('./whitechannels')(bot)
  // require('./about')
  // require('./ban')
  require('./getid')(bot)
  require('./help')(bot)
  require('./start')(bot)
  require('./whitelistuser')(bot)
  require('./leave')(bot)
}
