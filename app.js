const qs = require('querystring')
const blogRouter = require('./src/router/blog')
const userRouter = require('./src/router/user')
const { setRedis, getRedis } = require('./src/db/redis')

// 获取post请求体对象
const getPostData = (req) => {
  return new Promise((resolve, reject) => {
    if (req.method !== 'POST') {
      resolve({})
      return
    }
    if (req.headers['content-type'] !== 'application/json') {
      resolve({})
      return   
    }
    let postData = ''
    req.on('data', chunk => {
      postData += chunk.toString()
    })
    req.on('end', () => {
      if (postData) {
        resolve(JSON.parse(postData))
        return
      }
      resolve({})
    }) 
  }) 
}

const initSession = (req) => {
  let needSetCookie = false
  let sessionId = req.cookie.sessionId
  if (!sessionId) {
    needSetCookie = true
    sessionId = `${Date.now()}_${Math.random()}`
    req.sessionId =  sessionId
    return Promise.resolve({needSetCookie, session: {}})
  }
  return getRedis(sessionId).then(sessionData => {
    req.sessionId =  sessionId
    if (sessionData === null) {
      return {
        needSetCookie,
        session: {}
      }
    }
    req.session = sessionData
    return {
      needSetCookie,
      session: sessionData
    }
  })
}

const setCookieExpire = () => {
  let d = new Date()
  d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
  return d.toUTCString()
}

const app = async (req,res) => {
  console.log(req.host, 'host')
  res.setHeader('Content-type', 'application/json')
  const url = req.url
  const { cookie } = req.headers
  const path = url.split('?')[0]
  req.path = path
  req.query = qs.parse(url.split('?')[1])

  let postData = await getPostData(req)
  req.body = postData

  req.cookie = {}
  if (cookie) {
    let cookieData = cookie.split('; ')
    cookieData.forEach(item => {
      if (item) {
        let key = item.split('=')[0]
        let val = item.split('=')[1]
        req.cookie[key] = val
      }
    })
  }

  // 设置session
  let needSetCookie = false
  let sessionInfo = await initSession(req)
  needSetCookie = sessionInfo.needSetCookie

  // blog 路由
  const blogData = await blogRouter(req, res)
  if (blogData) {
    res.end(JSON.stringify(blogData))
    return
  }

  // user 路由
  const userData = await userRouter(req, res)
  if (userData) {
    // 如果登录成功， needSetCookie是true 就设置cookie
    if (userData.errorCode === 0 && needSetCookie) {
      res.setHeader('Set-Cookie', `sessionId=${req.sessionId}; path=/; httpOnly; expires=${setCookieExpire()}`)
    }
    res.end(JSON.stringify(userData))
    return
  }

  // 如果没有命中的请求
  res.writeHead(404, { "Content-type": "text/plain" })
  res.write("404 NOT FOUND \n")
  res.end()
}

module.exports = app
// process.env.NODE_ENV