const { bot } = require('./')

bot.command('getid', ({ from, chat, reply }) =>
  reply(`Your id: <code>${from && from.id ? from.id : 'not available'}</code>\nChat id: <code>${chat.id}</code>`, {
    parse_mode: 'HTML'
  })
)
