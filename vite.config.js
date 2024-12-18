import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 后端服务器地址配置 - 只需要修改这里的 IP 地址
const BACKEND_URL = 'http://10.108.70.254:3001'  // <-- 更改这里的 IP 地址

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: BACKEND_URL,  // 这里会自动使用上面定义的地址
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('代理错误:', {
              错误类型: err.name,
              错误消息: err.message,
              错误堆栈: err.stack,
              请求URL: req.url,
              目标地址: options.target + req.url
            })
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('发送代理请求:', {
              方法: req.method,
              URL: req.url,
              目标: options.target + req.url,
              请求头: proxyReq.getHeaders()
            })
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('收到代理响应:', {
              状态码: proxyRes.statusCode,
              URL: req.url,
              响应头: proxyRes.headers
            })
          })
        }
      }
    }
  }
})
