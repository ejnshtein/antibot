function getRandomInt (aMin, aMax) {
  return Math.floor(Math.random() * (aMax - aMin)) + aMin
}
let bots = new Array(100).map(() => getRandomInt(0, 1000000))
console.log(bots)
