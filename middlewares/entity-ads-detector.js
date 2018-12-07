const onlyPublic = require('./only-public')

module.exports = (entity, entityText, ctx) => {
  /* eslint no-mixed-operators: 0 */
  /* eslint operator-linebreak: 0 */
  if (!onlyPublic.isPublic(ctx)) {
    return false
  }
  const { chatConfig } = ctx.state
  const testingEntity = entity.type === 'text_link' && entity.url || entity.type === 'url' && entityText
  return (
    testingEntity
    && /t\.me\/joinchat\/\S+/ig.test(testingEntity)
    && (
      chatConfig.restrictJoinchatMessage ||
      typeof chatConfig.restrictJoinchatMessage === 'undefined'
    )
    ||
    testingEntity
    && /t\.me\/\S+?bot\?=?start=?\S+/ig.test(testingEntity)
    && (
      chatConfig.restrictBotStartMessage ||
      typeof chatConfig.restrictBotStartMessage === 'undefined'
    )
  )
}
