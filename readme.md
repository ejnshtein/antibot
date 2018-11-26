# Antibot

## Description

I so much hate ad-bots in my telegram work chat's, so I decided to create this bot with something-like captcha and some filters.  

- When a user joins the chat, bot immediately restricts it until forever and asks to confirm that it isn't a robot. If it's human, just need to click "I'm not a robot!". Then bot will delete his message and allow a user to write in the chat. If not, the bot will wait for 24 hour's and then ban user account in that chat.  

- Bot catches all messages that were forwarded from the channels or bots. He will delete it immediately. If you want to allow some users to forward messages from channels and bots just use `/addwhite` and `/removewhite` commands to add or remove a user from this chat whitelist.

- Bot catches all messages that contains `t.me/joinchat/<random-chat-id>` and `t.me/<bot-username>bot?start=somedata` link types. Works with whitelist same as action above.

- A bot can report user actions in a separate chat/channel. He will send a message with all data (chat title, chat username or invite link and who sent the message which contains some suspicious content) and the message itself. Then admins can ban it immediately right here OR add to chat whitelist.  

**NOTE: Bot will check if you are a chat admin or not before doing an action. In a chat where a suspicious message was sent of course.**  

## How to use

Add [@antibotuser_bot](https://t.me/antibotuser_bot) to a chat/superchat and give it admin rights. Then bot will work as I intended.  
Here's test group, where you can look how it works: [t.me/antibot_testgroup](https://t.me/antibot_testgroup)

## Default chat config

```json
    {
        "whiteListUsers":[],
        "captcha":true,
        "forwardMessageAlert":false,
        "restrictFwdMessageFromChannel":true,
        "restrictFwdMessageFromBot":true,
        "restrictJoinchatMessage":true,
        "restrictBotStartMessage":true,
        "restrictOtherMessages": false,
        "report":false,
        "reportChatId":-1001360010005
    }
```

If you want to change them, contact me.

## Contact

[Telegram](https://t.me/ejnshtein)
