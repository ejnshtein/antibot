module.exports = (startTime) => (ctx, next) => {
  // console.log(ctx.updateType, ctx)
  if (ctx.updateType === 'message') {
    if (startTime - ctx.message.date < 20) {
      next(ctx)
    }
  } else {
    next(ctx)
  }
}
