const {
  templateDetector
} = require('../middlewares')
const Composer = require('telegraf/composer')
const composer = new Composer()
const {
  mongodb: {
    collection
  }
} = require('../database')

composer.on('new_chat_members', templateDetector, async ctx => {
  /* eslint camelcase: 0 */
  const {
    chatConfig
  } = ctx.state
  if (ctx.message.new_chat_members.some(el => el.is_bot)) {
    const member = await ctx.getChatMember(ctx.message.from.id)
    if (member && (member.status === 'creator' || member.status === 'administrator')) {
      return
    }
  }
  const {
    new_chat_members
  } = ctx.message

  if (typeof chatConfig.restrictOtherMessages === 'boolean' && chatConfig.restrictOtherMessages) {
    for (const member of new_chat_members) {
      try {
        await ctx.restrictChatMember(member.id, {
          until_date: Math.round(Date.now() / 1000) + 10,
          can_send_other_messages: false
        })
      } catch (e) {
        return ctx.reply(e.description)
      }
    }
  }

  if (!((typeof chatConfig.captcha === 'undefined' && !chatConfig.captcha) || (typeof chatConfig.captcha === 'boolean' && chatConfig.captcha))) {
    return
  }
  const captchaMessage = await ctx.reply('Confirm that you are not a robot.', {
    reply_to_message_id: ctx.message.message_id,
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'I\'m not a robot.',
          callback_data: `notarobot:${ctx.message.new_chat_members.map(user => user.id).join(',')}`
        }]
      ]
    }
  })
  for (const member of new_chat_members) {
    const user = await collection('robots').findOne({
      userId: member.id,
      chatId: ctx.chat.id
    }).exec()
    if (!user) {
      const config = {
        userId: member.id,
        chatId: ctx.chat.id,
        tgUser: member,
        joinMessageId: ctx.message.message_id,
        captchaMessageId: captchaMessage.message_id
      }

      if (chatConfig && chatConfig.customBanDelay) {
        config.date = Date.now() + chatConfig.customBanDelay
      }
      if (member.template) {
        config.date = Date.now() + chatConfig && chatConfig.delayBotBan ? chatConfig.delayBotBan : 3600000
      }
      try {
        await ctx.restrictChatMember(member.id, {
          until_date: Math.round(Date.now() / 1000) + 10, // forever
          can_send_messages: false,
          can_send_media_messages: false,
          can_add_web_page_previews: false
        })
      } catch (e) {
        return ctx.reply(e.description)
      }
      await collection('robots').create(config) // will be banned in 1 day OR if template detected in 1 hour, see ./database/mongodb/schemas.js
    }
  }
})

module.exports = bot => {
  bot.use(composer.middleware())
}
