const { MYSQL_CONF } = require('../config/db')
const mysql = require('mysql')

// 创建连接对象
const con = mysql.createConnection(MYSQL_CONF)

// 连接数据库
con.connect()

// 统一执行sql语句
function exec(sql) {
  return new Promise((resolve, reject) => {
    con.query(sql, (err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve(result)
    })
  })
}

module.exports = {
  exec,
  escape: mysql.escape
}


