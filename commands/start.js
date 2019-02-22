const Composer = require('telegraf/composer')
const composer = new Composer()
const { onlyPublic } = require('../middlewares')

composer.start(
  Composer.branch(
    onlyPublic,
    (ctx, next) => next(),
    Composer.reply('Hello!\nI\'m telegram bot to restrict bots-like telegram users to send ads in public chats.\nUse /help for more info.', {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  )
)

module.exports = bot => {
  bot.use(composer.middleware())
}
