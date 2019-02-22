const { fromOwner } = require('../middlewares')
// const { mongodb: { collection } } = require('../database')
const Composer = require('telegraf/composer')
const composer = new Composer()

composer.hears(/\/leave (\S+)/i, fromOwner(process.env.ADMIN_ID), async ctx => {
  const { collection } = ctx
  let chatId
  if (/-[0-9]+/i.test(ctx.match[1])) {
    chatId = Number.parseInt(ctx.match[1])
  } else {
    return ctx.reply('I support only numbers')
  }
  const chat = await collection('chats').findOne({ chatId: chatId }).exec()
  if (chat) {
    let isLeavedChat
    try {
      isLeavedChat = await ctx.telegram.leaveChat(chatId)
    } catch (e) {
      return ctx.reply(e.description)
    }
    ctx.reply(`Leave chat result: ${isLeavedChat.toString()}`)
    try {
      await chat.remove()
    } catch (e) {
      return ctx.reply(e.description)
    }
    ctx.reply('DB cleaned')
  } else {
    ctx.reply('Chat not found in db', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Try to leave anyway',
              callback_data: `leave:${chatId}`
            }
          ]
        ]
      }
    })
  }
})

composer.action(/leave:(\S+)/i, fromOwner(process.env.ADMIN_ID), async ctx => {
  let chatId
  if (/-[0-9]+/i.test(ctx.match[1])) {
    chatId = Number.parseInt(ctx.match[1])
  } else {
    return ctx.answerCbQuery('I support only numbers')
  }
  let isLeavedChat
  try {
    isLeavedChat = await ctx.telegram.leaveChat(chatId)
  } catch (e) {
    return ctx.answerCbQuery(e.description)
  }
  if (isLeavedChat) {
    ctx.editMessageReplyMarkup({ inline_keyboard: [] })
    return ctx.answerCbQuery('Done')
  } else {
    ctx.answerCbQuery(`Result: ${isLeavedChat.toString()}`)
  }
})

module.exports = bot => {
  bot.use(composer.middleware())
}
