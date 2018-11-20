module.exports = async (ctx, next) => {
    const botTemplates = ctx.message.new_chat_members.filter(({ first_name, username, last_name }) =>
        username &&
        last_name &&
        new RegExp(`${last_name}_[a-z]{4}`, 'i').test(username) ||
        first_name &&
        username &&
        first_name === username ||
        first_name &&
        last_name &&
        username &&
        username === `${first_name}${last_name}` ||
        first_name &&
        last_name &&
        username &&
        username === `${first_name}${last_name}`.toLocaleLowerCase()
    )
    if (botTemplates.length > 0) {
        botTemplates.forEach(member => member.template = true)
    }
    const blacklistes = ctx.message.new_chat_members.filter(member => member.first_name.startsWith('╋VX,QQ（同号）') || member.first_name.startsWith('╋VX(QQ)'))
    if (blacklistes.length > 0) {
        for (const member in blacklistes) {
            await ctx.kickChatMember(blacklistes[member].id)
            delete blacklistes[member]
        }
    } else {
        next()
    }
}