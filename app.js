const util = require('util')
const cron = require('node-cron')
const Telegraf = require('telegraf')
const botConfig = require('./bot.config.json')
const database = require('./database')
const middlewares = require('./middlewares')
const bot = new Telegraf(botConfig.token)

cron.schedule('* 0-23 * * *', async () => { // check each hour
    const robots = await database.mongodb.collection('robots').find({ date: { $lte: Date.now() }, banned: { $not: { $eq: true } }}).exec()
    if (robots.length) {
        for (const robot of robots) {
            await bot.telegram.kickChatMember(robot.chatId, robot.userId, Math.round(Date.now() / 1000) + 10)
            robot.banned = true
            robot.markModified('banned')
            await robot.save()
        }
    }
})
bot.start(ctx => {
    ctx.reply('Hello!\nI\'m telegram bot to restrict bots-like telegram users to send ads in public chats.\nFull description at <a href="https://github.com/ejnshtein/antibot#description">Github</a>', {
        parse_mode: 'HTML',
        disable_web_page_preview: true
    })
})
bot.help(ctx => {
    ctx.reply('Bot description at <a href="https://github.com/ejnshtein/antibot#description">Github</a>\nYou can also contact with bot developer -> @ejnshtein', {
        parse_mode: 'HTML',
        disable_web_page_preview: true
    })
})
bot.on('new_chat_members', middlewares.botDetector, async ctx => {
    if (ctx.message.new_chat_members.some(el => el.is_bot)) {
        const member = await ctx.getChatMember(ctx.message.from.id).catch(util.log)
        if (member && (member.status === 'creator' || member.status === 'administrator')) {
            return
        }
    }
    const members = ctx.message.new_chat_members
    for (const member of members) {
        const user = await database.mongodb.collection('robots').findOne({ userId: member.id, chatId: ctx.chat.id }).exec()
        if (!user) {
            const config = { userId: member.id, chatId: ctx.chat.id }
            if (member.template) {
                config.date = Date.now() + 7200000
            }
            await database.mongodb.collection('robots').create(config) // will be banned in 2 days OR if template detected in 2 hours, see ./database/mongodb/schemas.js
            await ctx.restrictChatMember(member.id, {
                until_date: Math.round(Date.now() / 1000) + 10, // forever
                can_send_messages: false,
                can_send_media_messages: false,
                can_send_other_messages: false,
                can_add_web_page_previews: false
            }).catch(util.log)
        }
        ctx.reply(`Confirm that you are not a robot.\nYou will be banned in 2 ${member.template ? 'hours' : 'days'}`, {
            reply_to_message_id: ctx.message.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'I\'m not a robot.',
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