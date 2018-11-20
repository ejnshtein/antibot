const util = require('util')
const { schedule } = require('node-cron')
const Telegraf = require('telegraf')
const botConfig = require('./bot.config.json')
const { mongodb: { collection } } = require('./database')
const { botDetector, onlyAdmin, onlyPublic } = require('./middlewares')
const bot = new Telegraf(botConfig.token)
const { telegram } = bot

schedule('* 0-23 * * *', async () => { // check each hour
    const robots = await collection('robots').find({ date: { $lte: Date.now() }, banned: { $not: { $eq: true } }}).exec()
    if (robots.length) {
        for (const robot of robots) {
            await telegram.kickChatMember(robot.chatId, robot.userId, Math.round(Date.now() / 1000) + 10)
            robot.banned = true
            robot.markModified('banned')
            await robot.save()
        }
    }
})

bot.use(async (ctx, next) => {
    if (ctx.chat.type === 'supergroup' || ctx.chat.type === 'group') {
        const dbchat = await collection('chats').findOne({ chatId: ctx.chat.id }).exec()
        if (dbchat) {
            ctx.local = {
                chatConfig: dbchat
            }
        } else {
            const chatConfig = await collection('chats').create({ chatId: ctx.chat.id, chatTitle: ctx.chat.title })
            ctx.local = {
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

bot.on('new_chat_members', botDetector, async ctx => {
    if (ctx.message.new_chat_members.some(el => el.is_bot)) {
        const member = await ctx.getChatMember(ctx.message.from.id)
        if (member && (member.status === 'creator' || member.status === 'administrator')) {
            return
        }
    }
    const { new_chat_members } = ctx.message
    for (const member of new_chat_members) {
        const user = await collection('robots').findOne({ userId: member.id, chatId: ctx.chat.id }).exec()
        if (!user) {
            const config = { userId: member.id, chatId: ctx.chat.id, tgUser: member }
            if (member.template) {
                config.date = Date.now() + 3600000
            }
            await collection('robots').create(config) // will be banned in 1 day OR if template detected in 1 hour, see ./database/mongodb/schemas.js
            await ctx.restrictChatMember(member.id, {
                until_date: Math.round(Date.now() / 1000) + 10, // forever
                can_send_messages: false,
                can_send_media_messages: false,
                can_send_other_messages: false,
                can_add_web_page_previews: false
            })
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
    // console.log(ctx.match)
    if (/[0-9,]+/i.test(ctx.match[1])) {
        const userIds = ctx.match[1].match(/[0-9]+/ig).map(Number.parseInt)
        if (!userIds.includes(ctx.from.id)) { return ctx.answerCbQuery('This message does not apply to you.')}
        const user = await collection('robots').findOne({chatId: ctx.chat.id, userId: ctx.from.id }).exec()
        if (user) {
            await ctx.restrictChatMember(ctx.from.id, {
                until_date: Math.round(Date.now() / 1000) + 10,
                can_send_messages: true,
                can_send_media_messages: true,
                can_send_other_messages: true,
                can_add_web_page_previews: true
            })
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
                ctx.deleteMessage()
            }
        }
    }
})

bot.command('addwhite', onlyPublic, onlyAdmin, async ctx => {
    if (ctx.message.reply_to_message) { // ctx.message.reply_to_message.from.id
        if (ctx.message.reply_to_message.from.is_bot) { return ctx.reply('This is bot.') }
        // const whiteListChat = await collection('chats').findOne({ chatId: ctx.chat.id })
        const { chatConfig } = ctx.local
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
        const { chatConfig } = ctx.local
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

bot.command('getid', ({ from, chat, reply }) => reply(`Your id: <code>${from.id}</code>\nChat id: <code>${chat.id}</code`, { parse_mode: 'HTML' }))

// forwardwhilelist
bot.on('message', async (ctx, next) => {
    const { message } = ctx
    const { chatConfig } = ctx.local
    // console.log(message.forward_from)
    if (
        (
            ctx.chat.type === 'supergroup' ||
            ctx.chat.type === 'group'
        ) && (
            message.forward_from_chat &&
            message.forward_from_chat.type === 'channel' &&
            chatConfig.restrictFwdMessageFromChannel ||
            message.forward_from &&
            message.forward_from.is_bot === true &&
            chatConfig.restrictFwdMessageFromBot
        ) &&
        !await onlyAdmin.isAdmin(ctx) &&
        !chatConfig.whiteListUsers.includes(ctx.from.id)
        ) {
        if (chatConfig && chatConfig.reportChatId) {
            const chat = await ctx.getChat()
            // console.log(chat)
            const { invite_link, title, username } = chat
            await ctx.telegram.sendMessage(chatConfig.reportChatId, `Forwarded message detected in chat "${title} - ${invite_link ? invite_link : `@${username}`}\nBy <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name} ${ctx.from.last_name ? ctx.from.last_name : ''}</a>`, { parse_mode: 'HTML' })
            await ctx.forwardMessage(chatConfig.reportChatId)
        }
        if (chatConfig && chatConfig.forwardMessageAlert) {
            await ctx.reply(`Forwarding messages not allowed, <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name} ${ctx.from.last_name ? ctx.from.last_name : ''}</a>`, {
                parse_mode: 'HTML'
            })
        }
        await ctx.deleteMessage()
    } else {
        next()
    }
})

bot.catch(util.log)

util.log('Bot is starting...')

bot.startPolling()

util.log('Bot started!')