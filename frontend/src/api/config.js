// 配置后端基础URL
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080'  // 开发环境
  : 'http://api.your-domain.com';  // 生产环境

// 使用axios
axios.create({
  baseURL: BASE_URL,
  withCredentials: true  // 如果需要发送cookies
}); 