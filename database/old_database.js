const admin = require('firebase-admin')
const serviceAccount = require('../config/firebase.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://website-8d475.firebaseio.com/'
})

const db = admin.database()

module.exports = {
    pushData (data, output) {
        db.ref(`telebot/${data.cluster}`).once('value', (snap) => {
            const datas = snap.val()
            if (datas) {
                for (const key in datas) {
                    if (datas[key] == data.value) {return output(true)}
                }
            }
            db.ref(`telebot/${data.cluster}`).push(data.value).then(output(false))
        })
    },
    pushLennyData (data, output) {
        db.ref('telebot/lenny').once('value', (snap) => {
            const lennyData = snap.val()
            let sett = true
            if (lennyData) {
                for (const key in lennyData) {
                    if (lennyData[key].text === data.text) {
                        sett = false
                        return output(`${data.text} already in db!`)
                    }
                }
            }
            if (sett) {
                db.ref('telebot/lenny').push(data).then(output(`${data.text} added to db!`))
            }
        })
    },
    pushAnimeData (data, output) {
        db.ref('telebot/anime').once('value', function (snap) {
            const animeData = snap.val()
            let sett = true
            if (animeData) {
                for (const key in animeData) {
                    if (animeData[key].engname.includes(data.engname)) {
                        sett = false
                        return db.ref(`telebot/anime/${key}`).set(data).then(output(`${data.engname} replaced to db!`))
                    }
                }
            }
            if (sett) {
                db.ref('telebot/anime').push(data).then(output(`${data.engname} added to db!`))
            }
        })
    },
    getData (data, output) {
        db.ref(`telebot/${data}`).once('value', function (snap) {
            output(snap.val())
        })
    }
}