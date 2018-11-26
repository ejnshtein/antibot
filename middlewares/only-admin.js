module.exports = async ({ message, telegram, deleteMessage }, next) => {
    const member = await telegram.getChatMember(message.chat.id, message.from.id)
    if (member && (member.status === 'creator' || member.status === 'administrator')) {
        return next()
    } else {
        return deleteMessage()
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