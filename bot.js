require('dotenv').config({ path: './.env' })
const { schedule } = require('node-cron')
const Telegraf = require('telegraf')
const { mongodb: { collection } } = require('./database')
const { report } = require('./utils')
const bot = new Telegraf(process.env.BOT_TOKEN)
const { telegram } = bot

telegram.getMe()
  .then(info => {
    bot.options.username = info.username
  })

bot.context.db = collection

bot.use(async (ctx, next) => {
  if (ctx.chat.type === 'supergroup' || ctx.chat.type === 'group') {
    const dbchat = await collection('chats').findOne({ chatId: ctx.chat.id }).exec()
    if (dbchat) {
      ctx.state = {
        chatConfig: dbchat
      }
    } else {
      const chat = await ctx.getChat()
      const chatConfig = await collection('chats').create({ chatId: ctx.chat.id, chatTitle: ctx.chat.title, chatData: chat })
      ctx.state = {
        chatConfig: chatConfig
      }
    }
  }
  next()
})

schedule(' */10 * * * *', async () => { // check 10 mins
  const robots = await collection('robots').find({ date: { $lte: Date.now() }, banned: { $not: { $eq: true } } }).exec()
  if (robots.length) {
    for (const robot of robots) {
      try {
        await telegram.kickChatMember(robot.chatId, robot.userId, Math.round(Date.now() / 1000) + 10)
      } catch (e) {
        return report(e, 'cron.schedule')
        //  {
        //     reply_markup: {
        //       inline_keyboard: [
        //         [
        //           {
        //             text: 'Remove user from db',
        //             callback_data: `rm:user=${robot.chatId},${robot.userId}`
        //           },
        //           {
        //             text: 'Try ban again',
        //             callback_data: `ban:user=${robot.chatId},${robot.userId}`
        //           }
        //         ]
        //       ]
        //     }
        //   }
      }
      robot.banned = true
      robot.markModified('banned')
      await robot.save()
    }
    report({ message: `Banned ${robots.length} bots.` })
  }
  // collection('robots').deleteMany({ date: { $gte: Date.now() - 1000 * 60 * 60 * 24 * 7 }, banned: { $eq: true } }).exec()
})

bot.catch(err => {
  report(err, 'bot.catch')
})

console.log('Bot is starting...')

bot.startPolling()

console.log('Bot started!')

module.exports = {
  bot
}
