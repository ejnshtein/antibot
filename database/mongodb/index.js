const schemas = require('./schemas')
module.exports = {
    collection (collectionName) {
        return schemas(collectionName)
    }
}