import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: '',  // 使用相对路径，通过 Vite 代理转发
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // 允许跨域携带cookie
})

// 添加重试机制
service.interceptors.response.use(undefined, async (err) => {
  const config = err.config;
  
  // 如果配置了重试机制，并且是连接超时错误
  if (config && config.retry && (err.code === 'ECONNABORTED' || !err.response)) {
    config.__retryCount = config.__retryCount || 0;
    
    if (config.__retryCount < config.retry) {
      config.__retryCount += 1;
      console.log(`请求重试中 (${config.__retryCount}/${config.retry})...`);
      
      // 延迟重试
      await new Promise(resolve => setTimeout(resolve, config.retryDelay || 1000));
      
      return service(config);
    }
  }
  
  return Promise.reject(err);
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 自动添加token到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
      console.log('添加认证头:', {
        token: token,
        headers: config.headers
      })
    } else {
      console.log('未找到 token，继续发送请求')
      // 如果是测试连接请求，不进行重定向
      if (config.url === '/api/products/search' && config.params?.pageSize === 1) {
        console.log('测试连接请求，跳过认证检查')
        return config
      }
      // 其他需要认证的接口，重定向到登录页
      if (window.location.pathname !== '/login' && config.url !== '/auth/login') {
        window.location.href = '/login'
        return Promise.reject(new Error('需要登录'))
      }
    }

    console.log('发送请求详细信息:', {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
      headers: config.headers,
      timeout: config.timeout
    })
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    console.log('请求成功详细信息:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    })

    return response.data
  },
  error => {
    // 处理取消请求的情况
    if (axios.isCancel(error)) {
      console.log('请求被取消')
      return Promise.reject(new Error('请求被取消'))
    }

    console.error('请求失败详细信息:', {
      code: error.code,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout,
        headers: error.config?.headers,
        重试次数: error.config?.__retryCount || 0
      },
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      } : null
    })

    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      const retryCount = error.config?.__retryCount || 0
      const maxRetries = error.config?.retry || 0
      console.error(`请求超时 (重试 ${retryCount}/${maxRetries} 次后)，请检查网络连接`)
    } else if (error.response) {
      const status = error.response.status
      const data = error.response.data

      if (status === 401 || status === 403 || (data && data.code === 401)) {
        console.error('认证失败或权限不足')
        if (!error.config.url.includes('/products/search')) {  // 不处理测试连接的认证错误
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
      } else {
        console.error(`服务器返回错误 (${status}):`, data)
      }
    } else if (error.request) {
      console.error('无响应:', error.request)
    } else {
      console.error('请求配置错误:', error.message)
    }

    return Promise.reject(error)
  }
)

export default service 