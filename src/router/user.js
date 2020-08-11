const { loginCheck } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { setRedis, getRedis } = require('../db/redis')

const userBlog = (req,res) => {
  const method = req.method
  const { path, sessionId } = req
  // 博客登录接口
  if (method === 'POST' && path === '/api/user/login') {
    const { body: { username, password } } = req
    const { sessionId } = req
    const result = loginCheck(username, password)
    return result.then(val => {
      if (val.username) {
        let session = {
          username: val.username,
          password: val.password
        }
        setRedis(sessionId, session)
        return  new SuccessModel('登录成功')
      }
      return new ErrorModel('登陆失败')
    })
  }

  // 测试用户登录
  if (method === 'GET' && path === '/api/user/test') {
    if (req.session && req.session.username) {
      return Promise.resolve(new SuccessModel(
        {
          session: req.session,
          msg: '已经登录成功'
        }
      ))
    }
    return Promise.resolve(new ErrorModel('没有登录'))
  }
}

module.exports = userBlog