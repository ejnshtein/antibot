const { bot } = require('./')
const { onlyAdmin, onlyPublic } = require('../middlewares')
const { mongodb: { collection } } = require('../database')

bot.command('addwhite', onlyPublic, onlyAdmin, async ctx => {
  if (ctx.message.reply_to_message) { // ctx.message.reply_to_message.from.id
    if (ctx.message.reply_to_message.from.is_bot) { return ctx.reply('This is bot.') }
    // const whiteListChat = await collection('chats').findOne({ chatId: ctx.chat.id })
    const { chatConfig } = ctx.state
    if (chatConfig) {
      if (chatConfig.whiteListUsers.includes(ctx.message.reply_to_message.from.id)) {
        return ctx.reply('User already in white list')
      } else {
        chatConfig.whiteListUsers.push(ctx.message.reply_to_message.from.id)
        chatConfig.markModified('whiteListUsers')
        await chatConfig.save()
      }
    } else {
      await collection('chats').create({
        chatId: ctx.chat.id,
        chatTitle: ctx.chat.title,
        whiteListUsers: [ctx.message.reply_to_message.from.id]
      })
    }
    ctx.reply('Done')
  } else {
    ctx.reply('To add someone in whitelist reply to user message with this command')
  }
})

bot.command('removewhite', onlyPublic, onlyAdmin, async ctx => {
  if (ctx.message.reply_to_message) { // ctx.message.reply_to_message.from.id
    if (ctx.message.reply_to_message.from.is_bot) { return ctx.reply('This is bot.') }
    const { chatConfig } = ctx.state
    if (chatConfig) {
      // console.log(chatConfig)
      chatConfig.whiteListUsers = chatConfig.whiteListUsers.filter(id => id !== ctx.message.reply_to_message.from.id)
      chatConfig.markModified('whiteListUsers')
      await chatConfig.save()
      ctx.reply('Done.')
    } else {
      ctx.reply('???')
    }
  } else {
    ctx.reply('To remove someone in whitelist reply to user message with this command')
  }
})
