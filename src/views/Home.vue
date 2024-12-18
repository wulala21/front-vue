<template>
  <el-container class="home-container">
    <el-header>
      <div class="header-content">
        <h2>库存管理系统</h2>
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </el-header>
    
    <el-main>
      <div class="toolbar">
        <div class="search-area">
          <el-input
            v-model="searchQuery"
            placeholder="输入客户姓名或产品代码搜索"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
        
        <div class="action-area">
          <el-button type="primary" @click="handleAdd">添加商品</el-button>
          <el-upload
            class="upload-btn"
            action="#"
            :show-file-list="false"
            :http-request="handleUpload"
            accept=".xlsx,.xls,.csv"
          >
            <el-button>导入文件</el-button>
          </el-upload>
          <el-button @click="handleExport">导出Excel</el-button>
        </div>
      </div>
      
      <product-list ref="productListRef" />
    </el-main>
    
    <add-product-dialog ref="addDialogRef" @success="handleAddSuccess" />
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ProductList from '@/components/ProductList.vue'
import AddProductDialog from '@/components/AddProductDialog.vue'
import { getProducts, exportExcel, importFile } from '@/api/product'

const router = useRouter()
const productListRef = ref()
const addDialogRef = ref()
const searchQuery = ref('')

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

const handleSearch = async () => {
  if (productListRef.value) {
    productListRef.value.handleSearch(searchQuery.value)
  }
}

const handleAdd = () => {
  if (addDialogRef.value) {
    addDialogRef.value.dialogVisible = true
  }
}

const handleAddSuccess = () => {
  if (productListRef.value) {
    productListRef.value.loadProducts()
  }
}

const handleUpload = async (options) => {
  try {
    const file = options.file
    // 验证文件类型
    const isExcel = file.type === 'application/vnd.ms-excel' || 
                    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    file.type === 'text/csv'
    if (!isExcel) {
      ElMessage.error('只能上传 Excel 或 CSV 文件!')
      return
    }

    console.log('开始上传文件:', file.name)
    // 上传文件
    const response = await importFile(file)
    console.log('上传响应:', response)
    
    // 处理响应
    if (response.summary) {
      const { total, success, error } = response.summary
      
      if (error > 0 && response.errors) {
        // 如果有错误，显示详细信息
        ElMessage({
          type: 'warning',
          message: `导入完成，成功: ${success}，失败: ${error}，总数: ${total}`,
          duration: 5000
        })
        
        // 显示错误详情
        console.error('导入错误详情:', response.errors)
        response.errors.forEach(err => {
          ElMessage({
            type: 'error',
            message: `产品 ${err.productCode}: ${err.error}`,
            duration: 5000
          })
        })
      } else {
        // 全部成功
        ElMessage.success(`成功导入 ${success} 条数据`)
      }
    } else {
      ElMessage.success('文件导入成功')
    }

    // 刷新产品列表
    if (productListRef.value) {
      productListRef.value.loadProducts()
    }
  } catch (error) {
    console.error('文件导入失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('文件导入失败，请检查文件格式')
    }
  }
}

const handleExport = async () => {
  try {
    const response = await exportExcel()
    const blob = new Blob([response], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `产品列表_${new Date().getTime()}.xlsx`
    link.click()
  } catch (error) {
    console.error(error)
    ElMessage.error('导出失败')
  }
}
</script>

<style scoped>
.home-container {
  height: 100vh;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  flex: 1;
  margin-right: 20px;
}

.search-input {
  width: 300px;
}

.action-area {
  display: flex;
  gap: 10px;
}

.upload-btn {
  display: inline-block;
}
</style> 