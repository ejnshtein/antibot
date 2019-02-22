const { schedule } = require('node-cron')
const Telegraf = require('telegraf').default
const collection = require('./database')
const { filterOldMessages } = require('../middlewares')
const { telegram: { report } } = require('../lib')
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.telegram.getMe()
  .then(info => {
    bot.options.username = info.username
  })

bot.context.collection = collection
bot.use(filterOldMessages(Math.floor(Date.now() / 1000)))

bot.use(async (ctx, next) => {
  if (ctx.chat.type === 'supergroup' || ctx.chat.type === 'group') {
    const dbchat = await collection('chats').findOne({ chatId: ctx.chat.id }).exec()
    if (dbchat) {
      ctx.state = {
        chatConfig: dbchat
      }
    } else {
      const chat = await ctx.getChat()
      const chatConfig = await collection('chats').create({
        chatId: ctx.chat.id,
        chatTitle: ctx.chat.title,
        chatData: chat
      })
      ctx.state = {
        chatConfig: chatConfig
      }
    }
  }
  next()
})

schedule(' */10 * * * *', async () => { // check 10 mins
  const robots = await collection('robots').find({
    date: {
      $lte: Date.now()
    },
    banned: {
      $not: {
        $eq: true
      }
    }
  }).exec()
  if (robots.length) {
    for (const robot of robots) {
      if (robot.joinMessageId) {
        try {
          await bot.telegram.deleteMessage(robot.chatId, robot.joinMessageId)
        } catch (e) {}
      }
      if (robot.captchaMessageId) {
        try {
          await bot.telegram.deleteMessage(robot.chatId, robot.captchaMessageId)
        } catch (e) {}
      }
      try {
        await bot.telegram.kickChatMember(robot.chatId, robot.userId, Math.round(Date.now() / 1000) + 10)
      } catch (e) {
        report(e, 'cron.schedule', {
          reply_markup: {
            inline_keyboard: [
              [{
                text: 'Remove user from db',
                callback_data: `cleardb=${robot.chatId}:${robot.userId}`
              }],
              [{
                text: 'Remove chat from db',
                callback_data: `cleardb=${robot.chatId}:null`
              }]
            ]
          }
        })
      }
      // console.log(robot)
      robot.banned = true
      robot.markModified('banned')
      await robot.save()
    }
    report({
      message: `Banned ${robots.length} bots.`
    })
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
