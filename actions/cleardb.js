const Composer = require('telegraf/composer')
const composer = new Composer()

composer.action(/cleardb=(\S+):(\S+)/i, async ctx => {
  const { collection } = ctx
  const condition = {
    chatId: Number.parseInt(ctx.match[1])
  }
  if (ctx.match[2] !== 'null') {
    condition.userId = Number.parseInt(ctx.match[2])
  }
  try {
    var result = await collection('robots').deleteMany(condition).exec()
  } catch (e) {
    return ctx.answerCbQuery(e.message)
  }
  if (!condition.userId) {
    try {
      await ctx.telegram.leaveChat(ctx.match[1])
    } catch (e) {
      return ctx.answerCbQuery(e.message)
    }
  }
  ctx.answerCbQuery(`Deleted: \n${result.n}`)
  ctx.editMessageReplyMarkup({ inline_keyboard: [] })
})

module.exports = bot => {
  bot.use(composer.middleware())
}
