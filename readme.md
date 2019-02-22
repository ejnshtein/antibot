# Antibot

## Description

I so much hate ad-bots in my telegram work chat's, so I decided to create bot with something like captcha and some filters.  

- When a user joins the chat, bot immediately restricts it until forever and asks to confirm that it isn't a robot. If it's human, just need to click "I'm not a robot!". Then bot will delete his message and allow a user to write in the chat. If not, the bot will wait for 24 hour's and then ban user account in chat.  

- Bot catches all messages that were forwarded from the channels or bots. He will delete it immediately. If you want to allow some users to forward messages from channels and bots just use `/addwhite` and `/removewhite` commands to add or remove a user from chat whitelist.

- Bot catches all messages that contains `t.me/joinchat/<random-chat-id>` and `t.me/<bot-username>bot?start=somedata` link types. Works with whitelist same as action above.

- A bot can report user actions in a separate chat/channel or even in pm. He will send a message with all data (chat title, chat username(if public chat) and who sent the message which contains some suspicious content) and the message itself. Then admins can ban it immediately right here OR add to chat whitelist.  

**NOTE: Bot will check if you are a chat admin or not before doing an action. In a chat where a suspicious message was sent of course.**  

## How to use

Add [@antibotuser_bot](https://t.me/antibotuser_bot) to a chat/superchat and give it admin rights. Then bot will work as I intended.  
Here's test group, where you can look how it works: [t.me/antibot_testgroup](https://t.me/antibot_testgroup)

## Default chat config

```json
    {
        "whiteListUsers": [],
        "captcha": true,
        "forwardMessageAlert": false,
        "restrictFwdMessageFromChannel": true,
        "restrictFwdMessageFromBot": true,
        "restrictJoinchatMessage": true,
        "restrictBotStartMessage": true,
        "restrictOtherMessages": false,
        "report": false,
        "delayBotBan": 3600000
    }
```

## Properties description

| Property | Type | Default | Description |  
| - | - | - | - |
| whiteListUsers | `number[]` | true |An array of whitelisted user ids. Can be controlled with commands `/addwhite` and `/removewhite` (Use them with *reply* on user message). |  
| captcha | `boolean` | true | Use captcha feature when user join chat. (It will filter these bots which just join chat without any other actions except sending ads.) |
| forwardMessageAlert | `boolean` | true | Send message with info that some actions are forbidden in this chat (forwarding message from channel, from bot or sending message with these links type: `t.me/joinchat` and `t.me/somebotusername?start=data`) |
| restrictFwdMessageFromChannel | `boolean` | true | Restrict forwarding message from channels which not located in white channels list. _*_|
| restrictFwdMessageFromBot | `boolean` | true | Restrict forwarding message from bots. |
| restrictJoinchatMessage | `boolean` | true | Restrict messages which contains `t.me/joinchat` links type. _*_ |
| restrictBotStartMessage | `boolean` | true | Restrict messages which contains `t.me/somebotusername?start=data` links type. _*_ |
| restrictOtherMessages | `boolean` | false | Restrict messages from inline bots. (Yes, it will also disable gifs, stickers and games. [Full description](https://core.telegram.org/bots/api#restrictchatmember).) |
| report | `boolean` | false | Report suspicious messages to report chat. |
| [reportChatId] | `number` | 0 | Report chat id |
| delayBotBan | `number` | 3600000 (ms) | Default ban delay if template detector detects bot-like account. |
| [customBanDelay] | `number` | 0 (ms) | Default ban delay for captcha. |

_*_ - Most of ads-bots use it.

Currently, change these settings can only me (bot developer) so,  
**if you want to use your own configs, [contact me.](#contact)**

## Note

- There's a whitelist of channels from which the bot allows forwarding of messages. **Only I** can add or delete channels from this list, so contact me if you wanna add a channel to it.
- If you wanna run a copy of my bot, create `.env` file and fill it the same as shown in `.env.example`.

## Contact

[My telegram](https://t.me/ejnshtein)  
[Demo group](https://t.me/antibot_testgroup)  
[Bot](https://t.me/antibotuser_bot)
