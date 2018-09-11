const util = require('util')
const cron = require('node-cron')
const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')
// const startTime = Math.round(Date.now() / 1000)
const botConfig = require('./bot.config.json')
const database = require('./database')
// const onlyAdmin = require('./middlewares/only-admin')
// const logger = require('./middlewares/logger')
const bot = new Telegraf(botConfig.token)
const telegram = new Telegram(botConfig.token)

cron.schedule('* 0-23 * * *', async () => { // check each hour
    const bots = await database.mongodb.collection('robots').find({ date: { $lte: Date.now() }, banned: { $not: { $eq: true } }}).exec()
    if (bots.length) {
        for (const bot of bots) {
            await telegram.kickChatMember(bot.chatId, bot.userId, Math.round(Date.now() / 1000) + 10)
            bot.banned = true
            bot.markModified('banned')
            await bot.save()
        }
    }
})
bot.start(ctx => {
    util.log(ctx.from.id)
})
bot.on('new_chat_members', async ctx => {
    if (ctx.message.new_chat_members.some(el => el.is_bot)) {
        const member = await telegram.getChatMember(ctx.message.chat.id, ctx.message.from.id).catch(util.log)
        if (member && (member.status === 'creator' || member.status === 'administrator')) {
            return
        }
    }
    const members = ctx.message.new_chat_members
    for (const member of members) {
        const user = await database.mongodb.collection('robots').findOne({ userId: member.id, chatId: ctx.chat.id }).exec()
        if (!user) {
            await database.mongodb.collection('robots').create({ userId: member.id, chatId: ctx.chat.id }) // will be banned in 2 days, see ./database/mongodb/schemas.js
            await ctx.restrictChatMember(member.id, {
                until_date: Math.round(Date.now() / 1000) + 10, // forever
                can_send_messages: false,
                can_send_media_messages: false,
                can_send_other_messages: false,
                can_add_web_page_previews: false
            }).catch(util.log)
        }
        ctx.reply('Confirm that you aren\'t a robot.', {
            reply_to_message_id: ctx.message.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'I\'m not a robot!',
                            callback_data: `notarobot:${ctx.message.from.id}`
                        }
                    ]
                ]
            }
        })
    }
})
bot.action(/notarobot:(\S+)/i, async ctx => {
    if (/[0-9]+/i.test(ctx.match[1])) {
        const restrictedUserId = Number.parseInt(ctx.match[1])
        if (restrictedUserId !== ctx.from.id) { return ctx.answerCbQuery('This message does not apply to you.')}
        const user = await database.mongodb.collection('robots').findOne({chatId: ctx.chat.id, userId: ctx.from.id }).exec()
        if (user) {
            await ctx.restrictChatMember(ctx.from.id, {
                until_date: Math.round(Date.now() / 1000) + 10,
                can_send_messages: true,
                can_send_media_messages: true,
                can_send_other_messages: true,
                can_add_web_page_previews: true
            }).catch(util.log)
            await user.remove()
            ctx.deleteMessage().catch(util.log)
        }
    }
})

bot.catch(util.log)

util.log('Bot is starting...')
bot.startPolling()
util.log('Bot started!')