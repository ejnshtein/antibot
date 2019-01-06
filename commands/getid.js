const Composer = require('telegraf/composer')
const composer = new Composer()

composer.command('getid', ({ from, chat, reply }) =>
  reply(`Your id: <code>${from && from.id ? from.id : 'not available'}</code>\nChat id: <code>${chat.id}</code>`, {
    parse_mode: 'HTML'
  })
)

module.exports = bot => {
  bot.use(composer.middleware())
}
