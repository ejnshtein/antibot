# Antibot

## Description

As all of us are having similar feelings about ad-bots in telegram work chat's I have found solution for  inner peace. 
Antibot:
When a new user joins the chat first bot restricts immediately notification and user should confirm being not a robot by clicking "I'm not a robot!". After antibot’s message will be deleted and user allowed join the chat. If the confirmation failed after 24 hour bot will ban user account in chat.
All forwarded messages from the channels or bots will be detected and deleted immediately by antibot. To allow some users to forward messages you can use /addwhite and /removewhite commands to add or remove a user from chat whitelist.
Bot catchs messages containing  t.me/joinchat/<random-chat-id> and t.me/<bot-username>bot?start=somedata link types. Similar action with whitelist.
A bot can report user all actions data in a separate chat/channel or even in pm. User will receive a message with all data (chat title, chat username (for public chat) and nickname of suspicious content sender. It gives admins possibility to ban OR add to chat whitelist it immediately. 
NOTE: make sure that you are a chat admin before doing an action. 

## How to use

Add @antibotuser_bot to a chat/superchat and give it admin rights. After bot will work as intended.
Here's test group where you can have a look how it works: t.me/antibot_testgroup .

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
| whiteListUsers | `number[]` | true |An array of whitelisted user ids. Can be controlled with commands /addwhite and /removewhite (Use them with reply on user message). |  
| captcha | `boolean` | true | Captcha feature is used  when user join chat. (Bots  which just join chat without any other actions except sending ads will be banned). |
| forwardMessageAlert | `boolean` | true | Sending message with info that some actions are forbidden in this chat (forwarding message from channel, from bot or sending message with these links type: t.me/joinchat and t.me/somebotusername?start=data) |
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

## Autoban 

Autoban will work on that message(more in future):

<img src='https://i.imgur.com/AdO1apG.png' width='400px' height='auto'>

## Note

There's a whitelist of channels from which the bot allows forward messages. 
Only I can add and delete channels from this list. Contact me in case you want to add a channel to it.
If you wanna run a copy of my bot, create .env file and fill it the same as shown in .env.example.

## Contact

[My telegram](https://t.me/ejnshtein)  
[Demo group](https://t.me/antibot_testgroup)  
[Bot](https://t.me/antibotuser_bot)
