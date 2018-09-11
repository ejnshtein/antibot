const util = require('util')
module.exports = async ({ message, telegram }, next) => {
    const member = await telegram.getChatMember(message.chat.id, message.from.id).catch(util.log)
    if (member && (member.status === 'creator' || member.status === 'administrator')) {
        return next()
    }
}