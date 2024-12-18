import request from '@/utils/request'

// 登录接口
export function login(data) {
  return request({
    url: '/users/login',
    method: 'post',
    data
  }).then(response => {
    // 保存token和用户信息到localStorage
    if (response.token) {
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
    }
    return response
  })
}

// 获取当前用户信息
export function getCurrentUser() {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// 测试登录接口
export function testLogin() {
  console.log('开始测试登录...')
  const testUser = {
    username: 'test',
    password: '123456'
  }
  
  return request({
    url: '/users/login',
    method: 'post',
    data: testUser
  }).then(response => {
    console.log('登录测试成功:', response)
    // 保存token和用户信息
    if (response.token) {
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      console.log('Token和用户信息已保存到localStorage')
    }
    return response
  }).catch(error => {
    console.error('登录测试失败:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    })
    throw error
  })
}

// 更新登出函数
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// 测试API连通性
export function testConnection() {
  console.log('开始测试API连通性...')
  return request({
    url: '/products/search',
    method: 'get',
    params: {
      page: 1,
      limit: 1
    }
  }).catch(error => {
    console.error('API连通性测试失败:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    })
    throw error
  })
}

// 添加一个测试用的基础连通性检查
export function testBaseConnection() {
  console.log('开始测试基础连通性...')
  return request({
    url: '/',
    method: 'get'
  }).catch(error => {
    console.error('基础连通性测试失败:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    })
    throw error
  })
}

// 注册接口
export function register(data) {
  return request({
    url: '/users/register',
    method: 'post',
    data
  })
}

// 测试注册
export function testRegister() {
  console.log('开始测试注册...')
  return request({
    url: '/users/register',
    method: 'post',
    data: {
      username: 'test',
      password: '123456',
      email: 'test@example.com'  // 如果需要邮箱
    }
  }).then(response => {
    console.log('注册测试成功:', response)
    return response
  }).catch(error => {
    console.error('注册测试失败:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    })
    throw error
  })
} 