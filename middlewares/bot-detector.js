module.exports = async (ctx, next) => {
    const botTemplates = ctx.message.new_chat_members.filter(member =>
        member.username &&
        member.last_name &&
        new RegExp(`${member.last_name}_[a-z]{4}`, 'i').test(member.username) ||
        member.first_name &&
        member.username &&
        member.first_name === member.username ||
        member.first_name &&
        member.last_name &&
        member.username &&
        member.username === `${member.first_name}${member.last_name}` ||
        member.first_name &&
        member.last_name &&
        member.username &&
        member.username === `${member.first_name}${member.last_name}`.toLocaleLowerCase()
    )
    if (botTemplates.length > 0) {
        botTemplates.forEach(member => member.template = true)
    }
    const blacklistes = ctx.message.new_chat_members.filter(member => member.first_name.startsWith('╋VX,QQ（同号）') || member.first_name.startsWith('╋VX(QQ)'))
    if (blacklistes.length > 0) {
        for (const member in blacklistes) {
            await ctx.kickChatMember(blacklistes[member].id)
            await ctx.deleteMessage()
            delete blacklistes[member]
        }
    } else {
        next()
    }
}