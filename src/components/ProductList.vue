<template>
  <div class="product-list">
    <div class="table-operations">
      <el-button 
        type="danger" 
        :disabled="!selectedRows.length"
        @click="handleBatchDelete"
      >
        批量删除
      </el-button>
    </div>

    <el-table 
      :data="products" 
      v-loading="loading" 
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="customer_name" label="客户姓名" />
      <el-table-column prop="product_name" label="产品名称" />
      <el-table-column prop="product_code" label="产品代码" />
      <el-table-column prop="quantity" label="数量" />
      <el-table-column prop="production_date" label="生产日期">
        <template #default="{ row }">
          {{ formatDate(row.production_date) }}
        </template>
      </el-table-column>
      <el-table-column prop="qr_code" label="二维码内容" />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button 
            type="danger" 
            size="small" 
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="15"
        :total="total"
        @current-change="handleCurrentChange"
        layout="total, prev, pager, next"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProducts, deleteProduct, batchDeleteProducts } from '@/api/product'

const currentPage = ref(1)
const total = ref(0)
const products = ref([])
const loading = ref(false)
const selectedRows = ref([])

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const loadProducts = async (query = '') => {
  try {
    loading.value = true
    const pageSize = 15

    console.log('开始加载产品列表，参数:', {
      当前页: currentPage.value,
      每页条数: pageSize,
      搜索关键词: query,
      期望数据范围: `第${(currentPage.value - 1) * pageSize + 1}条到第${currentPage.value * pageSize}条`
    })
    
    const response = await getProducts({
      pageNum: currentPage.value - 1,  // 转换为从0开始的页码
      pageSize: pageSize
    })
    
    console.log('加载响应:', response)
    
    if (response && response.data) {
      if (query) {
        // 如果是搜索，我们需要在前端过滤数据
        const filteredData = response.data.filter(item => 
          (item.customer_name && item.customer_name.toLowerCase().includes(query.toLowerCase())) || 
          (item.product_code && item.product_code.toLowerCase().includes(query.toLowerCase()))
        )
        products.value = filteredData
        total.value = filteredData.length
      } else {
        // 非搜索状态，直接使用后端返回的分页数据
        products.value = response.data
        total.value = response.total
      }
      
      console.log('分页信息:', {
        当前页: currentPage.value,
        每页条数: pageSize,
        总条数: total.value,
        当前数据条数: products.value.length,
        数据范围: `第${(currentPage.value - 1) * pageSize + 1}条到第${(currentPage.value - 1) * pageSize + products.value.length}条`
      })
    } else {
      console.warn('响应数据格式不正确:', response)
      products.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载产品列表失败，详细错误:', error)
    
    if (error.message === '未登录' || error.message === '登录已过期，请重新登录') {
      ElMessage.error('请重新登录')
      return
    }
    
    if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试')
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请检查网络连接')
    } else {
      ElMessage.error(error.response?.data?.message || '加载产品列表失败')
    }
    
    products.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleCurrentChange = (val) => {
  console.log('页码变化:', {
    原页码: currentPage.value,
    新页码: val,
    每页条数: 15
  })
  currentPage.value = val
  loadProducts()
}

const handleSearch = (query) => {
  currentPage.value = 1
  loadProducts(query)
}

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 处理单个删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      type: 'warning'
    })
    
    const id = row.id || row._id  // 兼容两种 ID 字段
    await deleteProduct(id)
    ElMessage.success('删除成功')
    await loadProducts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

// 处理批量删除
const handleBatchDelete = async () => {
  if (!selectedRows.value.length) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, 
      '提示',
      { type: 'warning' }
    )
    
    const ids = selectedRows.value.map(row => row.id || row._id)  // 兼容两种 ID 字段
    console.log('要删除的ID:', ids)
    
    const response = await batchDeleteProducts(ids)
    console.log('删除响应:', response)
    
    ElMessage.success(`成功删除 ${response.deletedCount} 条记录`)
    selectedRows.value = []  // 清空选择
    await loadProducts()     // 重新加载数据
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error(error.response?.data?.message || '批量删除失败')
    }
  }
}

onMounted(() => {
  loadProducts()
})

defineExpose({
  loadProducts,
  handleSearch
})
</script>

<style scoped>
.product-list {
  padding: 20px;
}

.table-operations {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style> 