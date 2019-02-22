const { fromOwner } = require('../middlewares')
const Composer = require('telegraf/composer')
const composer = new Composer()

composer.hears(/\/addchannel (\S+)/i, fromOwner(process.env.ADMIN_ID), async ctx => {
  let chatId
  if (/-[0-9]+/i.test(ctx.match[1])) {
    chatId = Number.parseInt(ctx.match[1])
  } else {
    return ctx.reply('I support only numbers')
  }
  const chat = await ctx.collection('whitechannels').findOne({ chatId: chatId }).exec()
  if (chat) {
    return ctx.reply('Channel already in whitelist')
  } else {
    try {
      await ctx.db.collection('whitechannels').create({ chatId: Number.parseInt(ctx.match[1]) })
    } catch (e) {
      return ctx.reply(e.description)
    }
    ctx.reply('Channel added to whitelist')
  }
})

composer.hears(/\/removechannel (\S+)/i, fromOwner(process.env.ADMIN_ID), async ctx => {
  let chatId
  if (/-[0-9]+/i.test(ctx.match[1])) {
    chatId = Number.parseInt(ctx.match[1])
  } else {
    return ctx.reply('Chat id must be number')
  }
  const chat = await ctx.collection('whitechannels').findOne({ chatId: chatId }).exec()
  if (chat) {
    try {
      await chat.remove()
    } catch (e) {
      return ctx.reply(e.description)
    }
    ctx.reply('Channel removed from whitelist')
  } else {
    ctx.reply('Channel not in whitelist')
  }
})

module.exports = bot => {
  bot.use(composer.middleware())
}
