module.exports = (ctx, next) => {
    if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
        next()
    } else {
        ctx.reply('This command cannot be executed in this chat.')
    }
}
module.exports.isPublic = (ctx, next) => {
    if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
        ctx.chat.isPublic = true
    } else {
        ctx.chat.isPublic = false
    }
    if (typeof next === 'function') {
        next()
    } else {
        return ctx.chat.isPublic
    }
}