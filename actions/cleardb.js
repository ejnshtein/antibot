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
    console.log(e)
    return ctx.answerCbQuery('error!')
  }
  ctx.answerCbQuery(`done\n${result.n}`)
  ctx.editMessageReplyMarkup({ inline_keyboard: [] })
})

module.exports = bot => {
  bot.use(composer.middleware())
}
