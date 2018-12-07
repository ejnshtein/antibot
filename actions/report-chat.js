const { bot } = require('./')
const { ttlCheck } = require('../middlewares')
const { telegram } = bot
const { mongodb: { collection } } = require('../database')
const { reportMsgTtl, report } = require('../utils')

bot.action(/whitelist:(\S+),(\S+),(\S+)/i, ttlCheck(3), async ctx => {
  const chatId = ctx.match[1]
  const userId = Number.parseInt(ctx.match[2])
  const user = await telegram.getChatMember(chatId, ctx.from.id)
  if (user && (user.status === 'creator' || user.status === 'administrator')) {
    const chat = await collection('chats').findOne({ chatId: chatId }).exec()
    if (chat) {
      if (chat.whiteListUsers.some(el => el === userId)) {
        chat.whiteListUsers = chat.whiteListUsers.filter(el => el !== userId)
        chat.markModified('whiteListUsers')
        try {
          await chat.save()
        } catch (e) {
          ctx.answerCbQuery('error: ' + e.description)
          return report(e, 'whitelist.remove')
        }
        ctx.answerCbQuery('User removed from whitelist')
        ctx.editMessageReplyMarkup({
          inline_keyboard: [
            [
              {
                text: 'Ban',
                callback_data: `fwd:ban=${chatId},${userId},${reportMsgTtl(7)}`
              },
              {
                text: 'Add user to Whitelist',
                callback_data: `whitelist:${chatId},${userId},${reportMsgTtl(7)}`
              }
            ]
          ]
        })
      } else {
        chat.whiteListUsers.push(userId)
        chat.markModified('whiteListUsers')
        try {
          await chat.save()
        } catch (e) {
          ctx.answerCbQuery('error: ' + e.description)
          return report(e, 'whitelist.add')
        }
        ctx.answerCbQuery('User added to whitelist')
        ctx.editMessageReplyMarkup({
          inline_keyboard: [
            [
              {
                text: 'Remove user from whitelist',
                callback_data: `whitelist:${chatId},${userId},${reportMsgTtl(7)}`
              }
            ]
          ]
        })
      }
    } else {
      ctx.answerCbQuery('Chat not found.')
    }
  } else {
    ctx.answerCbQuery('You have no rigths in this chat.')
  }
})

// bot.action(/ban:(\S+),(\S+),(\S+)/i)

bot.action(/fwd:(\S+)=(\S+),(\S+),(\S+)/i, ttlCheck(4), async ctx => {
  const value = ctx.match[1]
  const chatId = ctx.match[2]
  const userId = Number.parseInt(ctx.match[3])
  const user = await telegram.getChatMember(chatId, ctx.from.id)
  if (user && (user.status === 'creator' || user.status === 'administrator')) {
    if (value === 'ban') {
      try {
        await telegram.kickChatMember(chatId, userId)
      } catch (e) {
        return ctx.answerCbQuery('error: ' + e.description)
      }
      ctx.answerCbQuery('Done.')
      ctx.editMessageReplyMarkup({
        inline_keyboard: [
          [
            {
              text: 'Unban',
              callback_data: `fwd:unban=${chatId},${userId},${reportMsgTtl(7)}`
            }
          ]
        ]
      })
    } else if (value === 'unban') {
      try {
        await telegram.unbanChatMember(chatId, userId)
      } catch (e) {
        return ctx.answerCbQuery('error: ' + e.description)
      }
      ctx.answerCbQuery('Done.')
      ctx.editMessageReplyMarkup({
        inline_keyboard: [
          [
            {
              text: 'Ban',
              callback_data: `fwd:ban=${chatId},${userId},${reportMsgTtl(7)}`
            },
            {
              text: 'Whitelist user',
              callback_data: `whitelist:${chatId},${userId},${reportMsgTtl(7)}`
            }
          ]
        ]
      })
    }
  } else {
    ctx.answerCbQuery('You have no rigths in this chat.')
  }
})
