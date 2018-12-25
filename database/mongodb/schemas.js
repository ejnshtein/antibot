const mongoose = require('mongoose')
const { Schema } = mongoose
const config = require('../../config.json')
const { report } = require('../../utils')
const connection = mongoose.createConnection(`mongodb+srv://${config.database.mongodb.username}:${config.database.mongodb.password}@${config.database.mongodb.url}`, {
  useNewUrlParser: true
})
connection.then(() => console.log('DB connected'))

connection.catch(err => {
  report(err, 'mongodb.connectionError')
})

connection.on('error', err => {
  report(err, 'mongodb.connectionError')
})
connection.on('disconnected', () => {
  report({ message: 'Mongodb disconnected' }, 'mongodb.disconnected')
})

const collections = [{
  name: 'robots',
  schema: new Schema({
    userId: { type: Number },
    tgUser: { type: Schema.Types.Mixed, required: false },
    chatId: { type: Number },
    date: { type: Date, required: false, default: () => Date.now() + 86400000 },
    banned: { type: Boolean, default: false },
    joinMessageId: { type: Number, required: false },
    captchaMessageId: { type: Number, required: false }
  })
}, {
  name: 'chats',
  schema: new Schema({
    chatTitle: { type: String },
    chatId: { type: Number },
    chatData: { type: Object, required: false, default: {} },
    whiteListUsers: { type: [Number], default: [], required: false },
    captcha: { type: Boolean, default: true, required: false },
    forwardMessageAlert: { type: Boolean, default: false, required: true },
    restrictFwdMessageFromChannel: { type: Boolean, default: true, required: true },
    restrictFwdMessageFromBot: { type: Boolean, default: true, required: true },
    restrictJoinchatMessage: { type: Boolean, default: true, required: false },
    restrictBotStartMessage: { type: Boolean, default: true, required: false },
    restrictOtherMessages: { type: Boolean, default: false, required: false },
    report: { type: Boolean, default: false, required: false },
    reportChatId: { type: Number, default: 0, required: false },
    delayBotBan: { type: Number, default: 3600000, required: true },
    customBanDelay: { type: Number, required: false }
  })
}, {
  name: 'whitechannels',
  schema: new Schema({
    chatId: { type: Number }
  })
}]

module.exports = (collectionName) => {
  const collection = collections.find(el => el.name === collectionName)
  if (!collection) {
    throw new Error(`Collection not found: ${collectionName}`)
  }
  return connection.model(collectionName, collection.schema)
}
