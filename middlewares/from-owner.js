module.exports = (fromOwnerOnly) => (ctx, next) => {
  if (fromOwnerOnly) {
    if (ctx.from.id === fromOwnerOnly) {
      return next()
    }
  } else {
    next()
  }
}
