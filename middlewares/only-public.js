module.exports = (ctx, next) => {
    if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
        next()
    } else {
        ctx.reply('This command cannot be executed in this chat.')
    }
}