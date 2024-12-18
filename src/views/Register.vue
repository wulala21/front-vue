<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2>注册</h2>
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef">
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="密码" />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" :loading="loading" style="width: 100%">
            注册
          </el-button>
        </el-form-item>
        <el-link @click="$router.push('/login')">已有账号？立即登录</el-link>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const registerFormRef = ref()

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  try {
    await registerFormRef.value.validate()
  } catch (error) {
    console.error('表单验证失败:', error)
    return
  }
  
  try {
    loading.value = true
    const registerData = {
      username: registerForm.username,
      password: registerForm.password,
      email: `${registerForm.username}@example.com`
    }
    console.log('发送注册请求:', registerData)
    
    const response = await register(registerData)
    console.log('注册响应:', response)
    
    if (response && (response.success || response.message === '注册成功')) {
      ElMessage.success('注册成功')
      router.push('/login')
    } else {
      throw new Error(response?.message || '注册失败')
    }
  } catch (error) {
    console.error('注册失败:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config
    })

    // 如果错误消息是"注册成功"，说明实际上是成功的
    if (error.message === '注册成功') {
      ElMessage.success('注册成功')
      router.push('/login')
      return
    }

    // 根据不同的错误类型显示不同的错误信息
    if (error.code === 'ECONNABORTED') {
      ElMessage.error('注册请求超时，请检查网络连接')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请联系管理员')
    } else if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error(error.message || '注册失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.register-card {
  width: 400px;
}
</style> 