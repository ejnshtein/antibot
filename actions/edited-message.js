const { onlyPublic } = require('../middlewares')

const Composer = require('telegraf/composer')
const composer = new Composer()

composer.on('edited_message',
  onlyPublic,
  async ctx => {
    if (ctx.editedMessage.photo && ctx.editedMessage.caption.match(/t\.cn\/\S+/ig)) {
      try {
        await ctx.telegram.kickChatMember(ctx.chat.id, ctx.from.id)
      } catch (e) {
        return ctx.reply(e.message)
      }
    }
  })

module.exports = bot => {
  bot.use(composer.middleware())
}
