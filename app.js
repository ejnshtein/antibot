const util = require('util')
const { schedule } = require('node-cron')
const Telegraf = require('telegraf')
const botConfig = require('./bot.config.json')
const { mongodb: { collection } } = require('./database')
const { templateDetector, onlyAdmin, onlyPublic, ttlCheck } = require('./middlewares')
const bot = new Telegraf(botConfig.token, { channelMode: true })
const { telegram } = bot
telegram.getMe().then(info => {
    bot.options.username = info.username
})

function sendSuspiciuosMessage (reportChatId, chat, ctx) {
    return ctx.telegram.sendMessage(reportChatId, `Suspicious message detected.\nChat "${chat.title}" - ${chat.invite_link ? chat.invite_link : chat.username ?  `@${chat.username}` : 'username not available'}\nBy <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name} ${ctx.from.last_name ? ctx.from.last_name : ''}</a>`, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Ban',
                        callback_data: `fwd:ban=${chat.id},${ctx.from.id},${Date.now() + 1000 * 60 * 60 * 24 * 7}`
                    },
                    {
                        text: 'Whitelist user',
                        callback_data: `whitelist:${chat.id},${ctx.from.id},${Date.now() + 1000 * 60 * 60 * 24 * 7}`
                    }
                ]
            ]
        }
    })
}

schedule('* 0-23 * * * *', async () => { // check each hour
    const robots = await collection('robots').find({ date: { $lte: Date.now() }, banned: { $not: { $eq: true } }}).exec()
    if (robots.length) {
        for (const robot of robots) {
            try {
                await telegram.kickChatMember(robot.chatId, robot.userId, Math.round(Date.now() / 1000) + 10)
            } catch (e) {
                await robot.remove()
            }
            robot.banned = true
            robot.markModified('banned')
            await robot.save()
        }
    }
    // collection('robots').deleteMany({ date: { $gte: Date.now() - 1000 * 60 * 60 * 24 * 7 }, banned: { $eq: false } }).exec()
})

bot.use(async (ctx, next) => {
    if (ctx.chat.type === 'supergroup' || ctx.chat.type === 'group') {
        const dbchat = await collection('chats').findOne({ chatId: ctx.chat.id }).exec()
        if (dbchat) {
            ctx.state = {
                chatConfig: dbchat
            }
        } else {
            const chat = await ctx.getChat()
            const chatConfig = await collection('chats').create({ chatId: ctx.chat.id, chatTitle: ctx.chat.title, chatData: chat })
            ctx.state = {
                chatConfig: chatConfig
            }
        }
    }
    next()
})

bot.start(({ reply }) => reply('Hello!\nI\'m telegram bot to restrict bots-like telegram users to send ads in public chats.\nFull description at <a href="https://github.com/ejnshtein/antibot#description">Github</a>', {
        parse_mode: 'HTML',
        disable_web_page_preview: true
    })
)

bot.help(({ reply }) => reply('Bot description at <a href="https://github.com/ejnshtein/antibot#description">Github</a>\nYou can also contact with developer -> @ejnshtein', {
        parse_mode: 'HTML',
        disable_web_page_preview: true
    })
)

bot.on('new_chat_members', templateDetector, async ctx => {
    const { chatConfig } = ctx.state
    if (ctx.message.new_chat_members.some(el => el.is_bot)) {
        const member = await ctx.getChatMember(ctx.message.from.id)
        if (member && (member.status === 'creator' || member.status === 'administrator')) {
            return
        }
    }
    const { new_chat_members } = ctx.message

    if (typeof chatConfig.restrictOtherMessages === 'boolean' && chatConfig.restrictOtherMessages) {
        for (const member of new_chat_members) {
            try {
                await ctx.restrictChatMember(member.id, {
                    until_date: Math.round(Date.now() / 1000) + 10,
                    can_send_other_messages: false
                })
            } catch (e) {
                return ctx.reply(e.description)
            }
        }
    }

    if (!(typeof chatConfig.captcha === 'undefined' && !chatConfig.captcha || typeof chatConfig.captcha === 'boolean' && chatConfig.captcha)) {
        return
    }
    for (const member of new_chat_members) {
        const user = await collection('robots').findOne({ userId: member.id, chatId: ctx.chat.id }).exec()
        if (!user) {
            const config = { userId: member.id, chatId: ctx.chat.id, tgUser: member }
            if (member.template) {
                config.date = Date.now() + 3600000
            }
            try {
                await ctx.restrictChatMember(member.id, {
                    until_date: Math.round(Date.now() / 1000) + 10, // forever
                    can_send_messages: false,
                    can_send_media_messages: false,
                    can_add_web_page_previews: false
                })
            } catch (e) {
                return ctx.reply(e.description)
            }
            await collection('robots').create(config) // will be banned in 1 day OR if template detected in 1 hour, see ./database/mongodb/schemas.js
            
        }
    }
    ctx.reply('Confirm that you are not a robot.', {
        reply_to_message_id: ctx.message.message_id,
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'I\'m not a robot.',
                        callback_data: `notarobot:${ctx.message.new_chat_members.map(user => user.id).join(',')}`
                    }
                ]
            ]
        }
    })
})
bot.action(/notarobot:(\S+)/i, async ctx => {
    const { chatConfig } = ctx.state
    // console.log(ctx.match)
    if (/[0-9,]+/i.test(ctx.match[1])) {
        const userIds = ctx.match[1].match(/[0-9]+/ig).map(Number.parseInt)
        if (!userIds.includes(ctx.from.id)) { return ctx.answerCbQuery('This message does not apply to you.')}
        const user = await collection('robots').findOne({chatId: ctx.chat.id, userId: ctx.from.id }).exec()
        if (user) {
            try {
                await ctx.restrictChatMember(ctx.from.id, {
                    until_date: Math.round(Date.now() / 1000) + 10,
                    can_send_messages: true,
                    can_send_media_messages: true,
                    can_send_other_messages: typeof chatConfig.restrictOtherMessages === 'boolean' ? !chatConfig.restrictOtherMessages : true,
                    can_add_web_page_previews: true
                })
            } catch (e) {
                return ctx.reply(e.description)
            }
            await user.remove()
            if (userIds.filter(id => id !== ctx.from.id).length > 0) {
                ctx.editMessageReplyMarkup({
                    inline_keyboard: [
                        [
                            {
                                text: 'I\'m not a robot.',
                                callback_data: `notarobot:${userIds.filter(id => id !== ctx.from.id).join(',')}`
                            }
                        ]
                    ]
                })
            } else {
                try {
                    await ctx.deleteMessage()
                } catch (e) {
                    return ctx.reply(e.description)
                }
            }
        }
    }
})

bot.command('addwhite', onlyPublic, onlyAdmin, async ctx => {
    if (ctx.message.reply_to_message) { // ctx.message.reply_to_message.from.id
        if (ctx.message.reply_to_message.from.is_bot) { return ctx.reply('This is bot.') }
        // const whiteListChat = await collection('chats').findOne({ chatId: ctx.chat.id })
        const { chatConfig } = ctx.state
        if (chatConfig) {
            if (chatConfig.whiteListUsers.includes(ctx.message.reply_to_message.from.id)) {
                return ctx.reply('User already in white list')
            } else {
                chatConfig.whiteListUsers.push(ctx.message.reply_to_message.from.id)
                chatConfig.markModified('whiteListUsers')
                await chatConfig.save()
            }
        } else {
            await collection('chats').create({
                chatId: ctx.chat.id,
                chatTitle: ctx.chat.title,
                whiteListUsers: [ctx.message.reply_to_message.from.id]
            })
        }
        ctx.reply('Done')
    } else {
        ctx.reply('To add someone in whitelist reply to user message with this command')
    }
})

bot.command('removewhite', onlyPublic, onlyAdmin, async ctx => {
    if (ctx.message.reply_to_message) { // ctx.message.reply_to_message.from.id
        if (ctx.message.reply_to_message.from.is_bot) { return ctx.reply('This is bot.') }
        const { chatConfig } = ctx.state
        if (chatConfig) {
            // console.log(chatConfig)
            chatConfig.whiteListUsers = chatConfig.whiteListUsers.filter(id => id !== ctx.message.reply_to_message.from.id)
            chatConfig.markModified('whiteListUsers')
            await chatConfig.save()
            ctx.reply('Done.')
        } else {
            ctx.reply('???')
        }
    } else {
        ctx.reply('To remove someone in whitelist reply to user message with this command')
    }
})

bot.command('getid', ({ from, chat, reply, }) => reply(`Your id: <code>${from && from.id ? from.id : 'not available'}</code>\nChat id: <code>${chat.id}</code>`, { parse_mode: 'HTML' }))

bot.entity((entity, entityText, ctx) => {
    if (!onlyPublic.isPublic(ctx)) {
        return false
    }
    const { chatConfig } = ctx.state
    const testing = entity.type === 'text_link' && entity.url || entity.type === 'url' && entityText
    return (
        testing
        && /t\.me\/joinchat\/\S+/ig.test(testing)
        && (
            chatConfig.restrictJoinchatMessage ||
            typeof chatConfig.restrictJoinchatMessage === 'undefined'
        )
        ||
        testing
        && /t\.me\/\S+?bot\?=?start=?\S+/ig.test(testing)
        && (
            chatConfig.restrictBotStartMessage ||
            typeof chatConfig.restrictBotStartMessage === 'undefined'
        )
    )
}, onlyPublic.isPublic, async (ctx, next) => {
    const { chatConfig } = ctx.state
    if (
        ctx.chat.isPublic
        && !await onlyAdmin.isAdmin(ctx)
        && !chatConfig.whiteListUsers.includes(ctx.from.id)
        ) {
            if (chatConfig && chatConfig.report && chatConfig.reportChatId) {
                const chat = await ctx.getChat()
                await sendSuspiciuosMessage(chatConfig.reportChatId, chat, ctx)
                await ctx.forwardMessage(chatConfig.reportChatId)
            }
            if (chatConfig && chatConfig.forwardMessageAlert) {
                await ctx.reply(`Forwarding messages not allowed, <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name} ${ctx.from.last_name ? ctx.from.last_name : ''}</a>`, {
                    parse_mode: 'HTML'
                })
            }
            try {
                await ctx.deleteMessage()
            } catch (e) {
                return ctx.reply(e.description)
            }
        } else {
            next()
        }
})


// forwardwhilelist
bot.on('message', onlyPublic.isPublic, async (ctx, next) => {
    const { message } = ctx
    const { chatConfig } = ctx.state
    if (
        ctx.chat.isPublic
        && (
            message.forward_from_chat &&
            message.forward_from_chat.type === 'channel' &&
            chatConfig.restrictFwdMessageFromChannel ||
            message.forward_from &&
            message.forward_from.is_bot === true &&
            chatConfig.restrictFwdMessageFromBot
        )
        && !await onlyAdmin.isAdmin(ctx)
        && !chatConfig.whiteListUsers.includes(ctx.from.id)
        ) {
        if (chatConfig && chatConfig.report && chatConfig.reportChatId) {
            const chat = await ctx.getChat()
            await sendSuspiciuosMessage(chatConfig.reportChatId, chat, ctx)
            await ctx.forwardMessage(chatConfig.reportChatId)
        }
        if (chatConfig && chatConfig.forwardMessageAlert) {
            await ctx.reply(`Forwarding messages not allowed, <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name} ${ctx.from.last_name ? ctx.from.last_name : ''}</a>`, {
                parse_mode: 'HTML'
            })
        }
        try {
            await ctx.deleteMessage()
        } catch (e) {
            return ctx.reply(e.description)
        }
    } else {
        next()
    }
})

bot.action(/whitelist:(\S+),(\S+),(\S+)/i, ttlCheck(3), async ctx => {
    const chatId = ctx.match[1]
    const userId = Number.parseInt(ctx.match[2])
    const user = await telegram.getChatMember(chatId, ctx.from.id)
    if (user && (user.status === 'creator' || user.status === 'administrator')) {
        const chat = await collection('chats').findOne({ chatId: chatId }).exec()
        if (chat) {
            if (chat.whiteListUsers.some(el => el === userId)) {
                chat.whiteListUsers = chat.whiteListUsers.filter(el => el !== userId)
                chat.markModified('whiteListUsers')
                await chat.save()
                return ctx.answerCbQuery('User removed from whitelist')
            } else {
                chat.whiteListUsers.push(userId)
                chat.markModified('whiteListUsers')
                await chat.save()
                ctx.answerCbQuery('User added to whitelist')
            }
        } else {
            ctx.answerCbQuery('Chat not found.')
        }
    } else {
        ctx.answerCbQuery('You have no rigths in this chat.')
    }
})

bot.action(/fwd:(\S+)=(\S+),(\S+),(\S+)/i, ttlCheck(4), async ctx => {
    const value = ctx.match[1]
    const chatId = ctx.match[2]
    const userId = Number.parseInt(ctx.match[3])
    const user = await telegram.getChatMember(chatId, ctx.from.id)
    if (user && (user.status === 'creator' || user.status === 'administrator')) {
        if (value === 'ban') {
            telegram.kickChatMember(chatId, userId)
                .then(() => {
                    ctx.answerCbQuery('Done.')
                    ctx.editMessageReplyMarkup({
                        inline_keyboard: [
                            [
                                {
                                    text: 'Unban',
                                    callback_data: `fwd:unban=${chatId},${userId},${Date.now() + 1000 * 60 * 60 * 24 * 7}`
                                }
                            ]
                        ]
                    })
                })
                .catch(error => {
                    ctx.answerCbQuery('Bot error - ' + error.description)
                })
        } else if (value === 'unban') {
            telegram.unbanChatMember(chatId, userId)
                .then(() => {
                    ctx.answerCbQuery('Done.')
                    ctx.editMessageReplyMarkup({
                        inline_keyboard: [
                            [
                                {
                                    text: 'Ban',
                                    callback_data: `fwd:ban=${chatId},${userId},${Date.now() + 1000 * 60 * 60 * 24 * 7}`
                                },
                                {
                                    text: 'Whitelist user',
                                    callback_data: `whitelist:${chatId},${userId},${Date.now() + 1000 * 60 * 60 * 24 * 7}`
                                }
                            ]
                        ]
                    })
                })
                .catch(error => {
                    ctx.answerCbQuery('Bot error - ' + error.description)
                })
        }
    } else {
        ctx.answerCbQuery('You have no rigths in this chat.')
    }
})

bot.catch(util.log)

util.log('Bot is starting...')

bot.startPolling()

util.log('Bot started!')