module.exports = bot => {
  require('./human-confirm')(bot)
  require('./new-chat-members')(bot)
  require('./on-message')(bot)
  require('./report-chat')(bot)
  require('./cleardb')(bot)
}
