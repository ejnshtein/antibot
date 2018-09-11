const mongoose = require('mongoose')
const Schema = mongoose.Schema
const util = require('util')
const config = require('../../config.json')
const connection = mongoose.createConnection(`mongodb+srv://${config.database.mongodb.username}:${config.database.mongodb.password}@${config.database.mongodb.url}`, {
    useNewUrlParser:true
})
connection.then(() => util.log('DB connected'))

const collections = [{
    name: 'robots',
    schema: new Schema({
        userId: { type: Number },
        chatId: { type: Number },
        date: { type: Date, required: false, default: () => Date.now() + 172800000 },
        banned: { type: Boolean, default: false }
    })
}]

module.exports = (collectionName) => {
    const collection = collections.find(el => el.name === collectionName)
    if (!collection) {
        throw new Error(`Collection not found: ${collectionName}`)
    }
    return connection.model(collectionName, collection.schema)
}