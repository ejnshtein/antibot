const { onlyAdmin, onlyPublic, entityAdsDetector } = require('../middlewares')
const { telegram: { sendSuspiciuosMessage } } = require('../lib')

const Composer = require('telegraf/composer')
const composer = new Composer()

composer.entity(entityAdsDetector, onlyPublic.isPublic, async (ctx, next) => {
  /* eslint no-mixed-operators: 0 */
  /* eslint operator-linebreak: 0 */
  const { state: { chatConfig }, collection } = ctx
  if (
    ctx.chat.isPublic &&
    !await onlyAdmin.isAdmin(ctx) &&
    !chatConfig.whiteListUsers.includes(ctx.from.id)
  ) {
    if (chatConfig && chatConfig.report && chatConfig.reportChatId) {
      const fwdMessage = await ctx.forwardMessage(chatConfig.reportChatId)
      await sendSuspiciuosMessage(chatConfig.reportChatId, ctx, fwdMessage)
    }
    if (chatConfig && chatConfig.forwardMessageAlert) {
      await ctx.reply(`${chatConfig.restrictJoinchatMessage || typeof chatConfig.restrictJoinchatMessage === 'undefined'
        ? '<code>t.me/joinchat</code> type link'
        : ''} ${chatConfig.restrictBotStartMessage || typeof chatConfig.restrictBotStartMessage === 'undefined'
        ? 'and'
        : ''} ${chatConfig.restrictBotStartMessage || typeof chatConfig.restrictBotStartMessage === 'undefined'
        ? '<code>t.me/botusername?start</code> type link'
        : ''} not allowed, <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name} ${ctx.from.last_name ? ctx.from.last_name : ''}</a>`, {
        parse_mode: 'HTML'
      })
    }
    try {
      await ctx.deleteMessage()
    } catch (e) {
      return ctx.reply(e.description)
    }
  } else {
    next()
  }
})

composer.on('message', onlyPublic.isPublic, async (ctx, next) => {
  const { state: { chatConfig }, collection, message } = ctx
  if (
    ctx.chat.isPublic &&
    (
      message.forward_from_chat &&
      message.forward_from_chat.type === 'channel' &&
      chatConfig.restrictFwdMessageFromChannel ||
      message.forward_from &&
      message.forward_from.is_bot === true &&
      chatConfig.restrictFwdMessageFromBot
    ) &&
    !await onlyAdmin.isAdmin(ctx) &&
    !chatConfig.whiteListUsers.includes(ctx.from.id)
  ) {
    if (
      message.forward_from_chat &&
      message.forward_from_chat.type === 'channel' &&
      await collection('whitechannels').findOne({
        chatId: message.forward_from_chat.id
      }).exec()
    ) {
      return next()
    }
    if (chatConfig && chatConfig.report && chatConfig.reportChatId) {
      const fwdMessage = await ctx.forwardMessage(chatConfig.reportChatId)
      await sendSuspiciuosMessage(chatConfig.reportChatId, ctx, fwdMessage)
    }
    if (chatConfig && chatConfig.forwardMessageAlert) {
      await ctx.reply(`${chatConfig.restrictJoinchatMessage || typeof chatConfig.restrictJoinchatMessage === 'undefined'
        ? '<code>t.me/joinchat</code> type link'
        : ''} ${chatConfig.restrictBotStartMessage || typeof chatConfig.restrictBotStartMessage === 'undefined'
        ? 'and'
        : ''} ${chatConfig.restrictBotStartMessage || typeof chatConfig.restrictBotStartMessage === 'undefined'
        ? '<code>t.me/botusername?start</code> type link'
        : ''} not allowed, <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name} ${ctx.from.last_name ? ctx.from.last_name : ''}</a>`, {
        parse_mode: 'HTML'
      })
    }
    try {
      await ctx.deleteMessage()
    } catch (e) {
      return ctx.reply(e.description)
    }
  } else {
    next()
  }
})

module.exports = bot => {
  bot.use(composer.middleware())
}
