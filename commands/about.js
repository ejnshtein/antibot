const Composer = require('telegraf/composer')
const composer = new Composer()
const { onlyPublic } = require('../middlewares')

composer.command('about',
  Composer.branch(onlyPublic,
    (ctx, next) => next(),
    Composer.reply('Bot can restrict bot-like user via captha and/or detect and delete ads in chat where it works.', {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  )
)

module.exports = bot => {
  bot.use(composer.middleware())
}
