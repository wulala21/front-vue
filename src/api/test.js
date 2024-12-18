import request from '@/utils/request'

// 测试后端连接
export const testConnection = () => {
  return request({
    url: '/api/products/search',
    method: 'get',
    params: {
      page: 1,
      pageSize: 1
    },
    timeout: 15000,  // 增加超时时间到15秒
    validateStatus: function (status) {
      return status >= 200 && status < 600  // 允许任何状态码，用于测试连接
    },
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    retry: 2,  // 失败后重试2次
    retryDelay: 1000  // 重试间隔1秒
  })
} 