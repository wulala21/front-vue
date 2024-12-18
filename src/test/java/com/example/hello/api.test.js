// src/tests/api.test.js
import { testLogin } from '@/api/auth'
import { testProductSearch } from '@/api/product'

export async function runTests() {
  try {
    // 1. 测试登录
    console.log('=== 开始登录测试 ===')
    const loginResult = await testLogin()
    console.log('登录结果:', loginResult)

    // 2. 测试产品搜索
    console.log('=== 开始产品搜索测试 ===')
    const searchResult = await testProductSearch()
    console.log('搜索结果:', searchResult)

  } catch (error) {
    console.error('测试失败:', error)
  }
}