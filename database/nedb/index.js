const Datastore = require('nedb')
const util = require('util')
const config = require('../../config.json')
const nedb = {}
config.database.nedb.collections.forEach(collection => {
    nedb[collection] = new Datastore({
        filename: `./database/nedb/collections/${collection}.db`
    })
})
for (const key in nedb) {
    nedb[key].loadDatabase(err => err ? util.log('Nedb err - ', err) : util.log(`${key} loaded!`))
}

module.exports = {
    collection (collectionName) {
        return {
            insert (document) {
                return new Promise((res, rej) => {
                    nedb[collectionName].insert(document, (err, newdocument) => err ? rej(err) : res(newdocument))
                })
            },
            find (query = {}) {
                return new Promise((res, rej) => {
                    nedb[collectionName].find(query, (err, docs) => err ? rej(err) : res(docs))
                })
            },
            findOne (query = {}) {
                return new Promise((res, rej) => {
                    nedb[collectionName].findOne(query, (err, doc) => err ? rej(err) : res(doc))
                })
            },
            update (query, update, options = {}) {
                return new Promise((res, rej) => {
                    nedb[collectionName].update(query, update, options, (err, num) => err ? rej(err) : res(num))
                })
            },

            /**
             * @param {Object} options
             * @param {Boolean} [options.multi=false] Allows the removal of multiple documents if set to true.
             *
             * Default is false
             */
            remove (query, options = {}) {
                return new Promise((res, rej) => {
                    nedb[collectionName].remove(query, options, (err, num) => err ? rej(err) : res(num))
                })
            },
            count (query) {
                return new Promise((res, rej) => {
                    nedb[collectionName].count(query, (err, count) => err ? rej(err) : res(count))
                })
            }
        }
    }
}