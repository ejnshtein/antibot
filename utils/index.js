const { Telegram } = require('telegraf')

const telegram = new Telegram(process.env.BOT_TOKEN)

const utils = {
  report (error, prefix, extra = {}) {
    try {
      const bypassList = [
        'message to edit not found',
        'does not contain any stream',
        'Invalid data found',
        'reply message not found',
        'message is not modified',
        'MESSAGE_ID_INVALID',
        'Invalid duration',
        'bot was kicked',
        'Could not find codec parameters for stream',
        'CHAT_WRITE_FORBIDDEN',
        'have no rights to send a message',
        'does not have storage.buckets.create access',
        'Too Many Requests',
        'need administrator rights in the channel',
        'Conversion failed',
        'wrong file id',
        'End of file',
        'does not have storage.buckets.create access to project',
        'bot is not a member',
        'Gateway',
      ]
      for (const item of bypassList) {
        if (err.message && err.message.indexOf(item) > -1) {
          return
        }
      }
      telegram.sendMessage(process.env.ADMIN_ID, `${prefix ? ` (${prefix})` : ''}:\nMessage: ${err.message}\n\`\`\`${JSON.stringify(err, undefined, 2)}\`\`\``, Object.assign({
        parse_mode: 'HTML',
      }, extra))
    } catch {
      // Do nothing
    }
  },
  reportMsgTtl (days) {
    return Date.now() + 1000 * 60 * 60 * 24 * days
  },
  sendSuspiciuosMessage (chatId, ctx, fwdMessage) {
    return telegram.sendMessage(chatId, `
      Suspicious message detected.
      Chat "${ctx.chat.title}" - ${ctx.chat.username ? `@${ctx.chat.username}` : 'username not available'}
      By <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name} ${ctx.from.last_name ? ctx.from.last_name : ''}</a>`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Ban',
              callback_data: `fwd:ban=${ctx.chat.id},${ctx.from.id},${utils.reportMsgTtl(7)}`
            },
            {
              text: 'Whitelist user',
              callback_data: `whitelist:${ctx.chat.id},${ctx.from.id},${utils.reportMsgTtl(7)}`
            }
          ]
        ]
      },
      reply_to_message_id: fwdMessage.message_id
    })
  }
}

module.exports = utils