<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>登录</h2>
      <el-button @click="testBackend" size="small" style="margin-bottom: 20px">
        测试后端连接
      </el-button>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
        <el-link @click="$router.push('/register')">还没有账号？立即注册</el-link>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/user'
import { testConnection } from '@/api/test'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref()

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  try {
    await loginFormRef.value.validate()
  } catch (error) {
    console.error('表单验证失败:', error)
    return
  }
  
  try {
    loading.value = true
    console.log('发送登录请求:', loginForm)
    const { token } = await login(loginForm)
    console.log('登录成功，获取到token:', token)
    localStorage.setItem('token', token)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.response?.data?.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

const testBackend = async () => {
  try {
    console.log('开始测试后端连接...')
    const response = await testConnection()
    ElMessage.success('后端连接成功')
    console.log('后端连接测试响应:', response)
  } catch (error) {
    console.error('后端连接测试失败:', {
      错误类型: error.name,
      状态码: error.response?.status,
      错误消息: error.message,
      响应数据: error.response?.data,
      请求配置: {
        URL: error.config?.url,
        方法: error.config?.method,
        参数: error.config?.params
      }
    })
    ElMessage.error(`后端连接失败: ${error.message}`)
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.login-card {
  width: 400px;
}
</style> 