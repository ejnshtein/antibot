# Antibot

## Description

I hate so much an ad-bots activity in my Telegram work chats, so I decided to create a bot witch protects a chat with captcha-like question.

- When a user joins a chat, bot immediately restricts him of post any message there, asking him to confirm he isn't a robot. A human may easily confirm it clicking to the "I'm not a robot!" button. If he will click then the bot will delete its message and remove its restrictions. If a newcomer willn't click that button, the bot will wait for 24 hours and ban user's account for this chat.
- The bot catches all messages which were forwarded by a user from a channel or another bot, and immediately remove them. If you want to allow some users to forward their messages just use `/addwhite` and `/removewhite` commands to add or remove a user from a chat's whitelist.
- The bot catches all messages which contains links like `t.me/joinchat/<chat-id>` or `t.me/<bot-username>bot?start=somedata`. A whitelist functionality works in the same way like in a previous action.
- The bot can report about user's actions in another chat, channel or even in a private chat, sending a message object there. Then admins can ban it immediately right here OR add to chat whitelist.

> NOTE: The bot checks are you an admin of a chat where a suspicious message was sent, before do any action.

## Usage

Just add [@antibotuser_bot](https://t.me/antibotuser_bot) to your group or supergroup and give it an admin permissions.
There's a testing group, where you can check it work live: [@antibot_testgroup](https://t.me/antibot_testgroup)

## Default chat's configuration

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
| **`whiteListUsers`** | `number[]` | true |An array of whitelisted user ids. Can be controlled with commands `/addwhite` and `/removewhite` (Use them with *reply* on user message). |
| **`captcha`** | `boolean` | true | Use captcha feature when user join chat. (It will filter these bots which just join chat without any other actions except sending ads.) |
| **`forwardMessageAlert`** | `boolean` | true | Send message with info that some actions are forbidden in this chat (forwarding message from channel, from bot or sending message with these links type: `t.me/joinchat` and `t.me/somebotusername?start=data`) |
| **`restrictFwdMessageFromChannel`** | `boolean` | true | Restrict forwarding message from channels which aren't located in the whitelist. _*_|
| **`restrictFwdMessageFromBot`** | `boolean` | true | Restrict forwarding message from bots. |
| **`restrictJoinchatMessage`** | `boolean` | true | Restrict messages which contains `t.me/joinchat` links type. _*_ |
| **`restrictBotStartMessage`** | `boolean` | true | Restrict messages which contains `t.me/somebotusername?start=data` links type. _*_ |
| **`restrictOtherMessages`** | `boolean` | false | Restrict messages from inline bots. (Yes, it will also disable gifs, stickers and games. [Full description](https://core.telegram.org/bots/api#restrictchatmember).) |
| **`report`** | `boolean` | false | Report suspicious messages to report chat. |
| **`delayBotBan`** | `number` | 3600000 (ms) | Default ban delay if template detector detects bot-like account. |
| **`[reportChatId]`** | `number` | 0 | Report chat id |
| **`[customBanDelay]`** | `number` | 0 (ms) | Default ban delay for captcha. |

_*_ - Most of ads-bots use it.

Currently, change these settings can only me (bot developer) so,
**if you want to use your own configs, [contact me.](#contact)**

## Autoban

Autoban will work on that message(more in future):

<img src='https://i.imgur.com/AdO1apG.png' width='400px' height='auto'>

## Note

- There's a whitelist of channels from which the bot allows forwarding of messages. **Only I** can add or delete channels from this list, so contact me if you wanna add a channel to it.
- If you wanna run a copy of my bot, create `.env` file and fill it the same as shown in `.env.example`.

## Contact

[My telegram](https://t.me/ejnshtein)
[Demo group](https://t.me/antibot_testgroup)
[Bot](https://t.me/antibotuser_bot)
