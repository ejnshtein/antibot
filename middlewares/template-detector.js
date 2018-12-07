/* eslint camelcase: 0, operator-linebreak: 0, no-mixed-operators: 0 */
module.exports = async (ctx, next) => {
  const botTemplates = ctx.message.new_chat_members.filter(({ first_name, username, last_name }) =>
    (
      username
      && last_name
      && new RegExp(`${last_name}_[a-z]{4}`, 'i').test(username)
    )
    || (
      first_name
      && username
      && first_name === username
    )
    || (
      first_name
      && last_name
      && username
      && username === `${first_name}${last_name}`
    )
    || (
      first_name
      && last_name
      && username
      && username === `${first_name}${last_name}`.toLocaleLowerCase()
    )
  )
  if (botTemplates.length > 0) {
    botTemplates.forEach(member => { member.template = true })
  }
  const blacklistes = ctx.message.new_chat_members.filter(({ first_name }) =>
    first_name.includes('╋VX,QQ（同号）')
    || first_name.includes('╋VX(QQ)')
    || first_name.includes(':CunHuiPeng或主电报号:@manyan'))
  if (blacklistes.length > 0) {
    for (const member in blacklistes) {
      await ctx.kickChatMember(blacklistes[member].id)
      delete blacklistes[member]
    }
    await ctx.deleteMessage()
  } else {
    next()
  }
}
