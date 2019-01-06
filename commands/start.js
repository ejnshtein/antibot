const Composer = require('telegraf/composer')
const composer = new Composer()

composer.start(({ reply }) =>
  reply('Hello!\nI\'m telegram bot to restrict bots-like telegram users to send ads in public chats.\nUse /help for more info.', {
    parse_mode: 'HTML',
    disable_web_page_preview: true
  })
)

module.exports = bot => {
  bot.use(composer.middleware())
}
