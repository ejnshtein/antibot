module.exports = (id = 4) => async ({ match, editMessageReplyMarkup }, next) => {
    const ttl = Number.parseInt(match[id])
    if (Date.now() > ttl) {
        return editMessageReplyMarkup({ inline_keyboard: [] })
    } else {
        next()
    }
}