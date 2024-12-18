import request from '@/utils/request'

export function getProducts(params) {
  const token = localStorage.getItem('token')
  if (!token) {
    console.error('未找到认证 token')
    return Promise.reject(new Error('未登录'))
  }

  const apiParams = {
    page: params.pageNum + 1,
    pageSize: params.pageSize
  }

  console.log('开始获取产品列表，转换后的参数:', {
    原始参数: params,
    转换参数: apiParams,
    计算说明: {
      当前页: apiParams.page,
      每页数量: apiParams.pageSize,
      期望跳过数量: (apiParams.page - 1) * apiParams.pageSize,
      期望数据范围: `第${(apiParams.page - 1) * apiParams.pageSize + 1}条到第${apiParams.page * apiParams.pageSize}条`
    },
    token: token
  })

  return request({
    url: '/api/products/page',
    method: 'get',
    params: apiParams,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then(response => {
    console.log('获取产品列表原始响应:', response)
    
    let standardResponse = {
      data: [],
      total: 0
    }

    if (response && typeof response === 'object') {
      if (response.data && Array.isArray(response.data)) {
        standardResponse.data = response.data
        standardResponse.total = response.pagination?.total || response.data.length
      } else if (Array.isArray(response)) {
        standardResponse.data = response
        standardResponse.total = response.length
      }
    }

    console.log('标准化后的响应:', {
      数据条数: standardResponse.data.length,
      总条数: standardResponse.total,
      当前页: apiParams.page,
      每页条数: apiParams.pageSize,
      总页数: Math.ceil(standardResponse.total / apiParams.pageSize),
      实际数据范围: `第${(apiParams.page - 1) * apiParams.pageSize + 1}条到第${(apiParams.page - 1) * apiParams.pageSize + standardResponse.data.length}条`
    })

    return standardResponse
  }).catch(error => {
    console.error('获取产品列表失败:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        params: error.config?.params
      }
    })
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      throw new Error('登录已过期，请重新登录')
    }
    
    throw error
  })
}

export function addProduct(data) {
  return request({
    url: '/api/products',
    method: 'post',
    data,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
}

export function exportExcel() {
  return request({
    url: '/api/products/export',
    method: 'get',
    responseType: 'blob',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
}

export function importFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/api/products/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
}

export function deleteProduct(id) {
  return request({
    url: `/api/products/${id}`,
    method: 'delete',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
}

export function batchDeleteProducts(ids) {
  return request({
    url: '/api/products/batch',
    method: 'delete',
    data: { ids },
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
}

export function checkHealth() {
  console.log('开始健康检查...')
  return request({
    url: '/api/products/search',
    method: 'get',
    timeout: 20000,
    params: {
      limit: 1,
      page: 1
    },
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }).catch(error => {
    console.error('健康检查失败:', {
      message: error.message,
      code: error.code,
      config: error.config
    })
    throw error
  })
}

export function testProductSearch() {
  console.log('开始测试产品搜索...')
  return request({
    url: '/api/products/search',
    method: 'get',
    params: {
      page: 1,
      limit: 10
    },
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }).then(response => {
    console.log('产品搜索成功:', response)
    return response
  }).catch(error => {
    console.error('产品搜索失败:', error)
    throw error
  })
} 