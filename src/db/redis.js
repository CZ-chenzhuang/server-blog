const { REDIS_CONF } = require('../config/db')
const redis = require('redis')

const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)
redisClient.on('error', err => {
  console.error(err)
})

function setRedis (key, val) {
  if (typeof val === 'object') {
    val = JSON.stringify(val)
    redisClient.set(key, val, redis.print)
    return
  }
  redisClient.set(key, val, redis.print)
}

function getRedis (key) {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, val) => {
      if (err) {
        reject(err)
        return
      }
      if (val === null) {
         resolve(null) 
         return
      }
      try {
        resolve(
          JSON.parse(val)
        )
      } catch (error) {
        resolve(val)
      }
    })
  })
}

module.exports = {
  setRedis,
  getRedis
}