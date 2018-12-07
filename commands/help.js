const { bot } = require('./')

bot.help(({ reply }) =>
  reply(`
  What this bot can do:
  - Use captcha to filter inactive accounts or bots.  
  - Bot can catch all messages that were forwarded from the channels or bots. He will delete it immediately. If you want to allow some users to forward messages from channels and bots just use  <code>/addwhite</code> and <code>/removewhite</code> commands to add or remove a user from this chat whitelist.
  - Bot can catch all messages that contains <code>t.me/joinchat</code> and <code>t.me/somebotusername?start=somedata</code> link types. Works with whitelist same as action above.
  - Bot can report suspicious actions in a setuped chat/channel.

  Full description <a href="https://github.com/ejnshtein/antibot">here</a>
  `, {
    parse_mode: 'HTML',
    disable_web_page_preview: true
  })
)
