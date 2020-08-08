const { 
  getBlogList, 
  getBlogDetail,
  newBlog,
  updateBlog,
  delBlog
} = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const blogRouter = (req,res) => {
  const method = req.method
  const { path, query: { id } } = req
  // 博客列表接口
  if (method === 'GET' && path === '/api/blog/list') {
    const { author, keyword } = req.query
    let result = getBlogList(author, keyword)
    return result.then(listData => {
      return new SuccessModel(listData, '请求成功')
    })
  }
  // 博客详情接口
  if (method === 'GET' && path === '/api/blog/detail') {
    let result = getBlogDetail(id)
    return result.then(detailInfo => {
      return new SuccessModel(detailInfo, '请求详情成功')
    })
  }
  // 博客新建接口
  if (method === 'POST' && path === '/api/blog/new') {
    let result = newBlog(req.body)
    return result.then(newResult =>{
      return new SuccessModel(newResult, '新建博客成功')
    })
  }
  // 博客更新接口
  if (method === 'POST' && path === '/api/blog/update') {
    let result = updateBlog(id, req.body)
    return result.then(val => {
      if (val) {
        return new SuccessModel('更新博客成功') 
      }
      return new ErrorModel('更新博客失败')
    })
  }
  // 博客删除接口
  if (method === 'POST' && path === '/api/blog/del') {
    let { author } = req.body
    let result = delBlog(id, author)
    return result.then(val => {
      if (val) {
        return new SuccessModel('删除博客成功') 
      }
      return new ErrorModel('删除博客失败')
    })
  }
}

module.exports = blogRouter