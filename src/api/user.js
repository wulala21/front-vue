import request from '@/utils/request'
import axios from 'axios'

export function login(data) {
  return request({
    url: '/api/users/login',
    method: 'post',
    data
  }).then(response => {
    console.log('登录响应原始数据:', response)

    let token = null
    let userData = null

    // 处理不同的响应数据结构
    if (typeof response === 'object') {
      if (response.token) {
        token = response.token
        userData = response
      } else if (response.data?.token) {
        token = response.data.token
        userData = response.data
      } else if (response.access_token) {
        token = response.access_token
        userData = response
      }
    }

    if (!token) {
      console.error('登录响应中未找到token:', response)
      throw new Error('登录响应格式错误')
    }

    console.log('解析到的登录数据:', {
      token: token,
      userData: userData
    })

    // 保存认证信息
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))

    return {
      token: token,
      user: userData
    }
  }).catch(error => {
    console.error('登录失败:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    throw error
  })
}

export async function register(data) {
  console.log('注册请求数据:', data)
  
  // 创建一个专门用于注册的 axios 实例
  const registerAxios = axios.create({
    baseURL: '',  // 使用相对路径，通过 Vite 代理
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // 最大重试次数
  const maxRetries = 3
  let retryCount = 0

  while (retryCount < maxRetries) {
    try {
      const response = await registerAxios.post('/api/users/register', data)
      console.log('注册成功响应:', response.data)
      return response.data
    } catch (error) {
      retryCount++
      console.error(`注册请求失败 (尝试 ${retryCount}/${maxRetries}):`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })

      if (retryCount === maxRetries) {
        throw error
      }

      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
} 