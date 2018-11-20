const util = require('util')
module.exports = async ({ message, telegram, reply }, next) => {
    const member = await telegram.getChatMember(message.chat.id, message.from.id).catch(util.log)
    if (member && (member.status === 'creator' || member.status === 'administrator')) {
        return next()
    } else {
        reply('This command can be executed only by chat administrator.')
    }
}
module.exports.isAdmin = async ({ message, telegram }) => {
    const member = await telegram.getChatMember(message.chat.id, message.from.id)
    if (member && (member.status === 'creator' || member.status === 'administrator')) {
        return true
    } else {
        return false
    }
}