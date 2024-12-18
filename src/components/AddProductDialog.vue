<template>
  <el-dialog
    title="添加商品"
    v-model="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="客户姓名" prop="customerName">
        <el-input v-model="form.customerName" />
      </el-form-item>
      <el-form-item label="产品名称" prop="productName">
        <el-input v-model="form.productName" />
      </el-form-item>
      <el-form-item label="产品代码" prop="productCode">
        <el-input v-model="form.productCode" />
      </el-form-item>
      <el-form-item label="数量" prop="quantity">
        <el-input-number v-model="form.quantity" :min="1" />
      </el-form-item>
      <el-form-item label="生产日期" prop="productionDate">
        <el-date-picker
          v-model="form.productionDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="二维码内容" prop="qrCode">
        <el-input v-model="form.qrCode" type="number" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, defineEmits } from 'vue'
import { addProduct } from '@/api/product'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()

const form = reactive({
  customerName: '',
  productName: '',
  productCode: '',
  quantity: 1,
  productionDate: '',
  qrCode: ''
})

const rules = {
  customerName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  productCode: [{ required: true, message: '请输入产品代码', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  productionDate: [{ required: true, message: '请选择生产日期', trigger: 'blur' }],
  qrCode: [{ required: true, message: '请输入二维码内容', trigger: 'blur' }]
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.quantity = 1
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    await addProduct(form)
    ElMessage.success('添加成功')
    dialogVisible.value = false
    emit('success')
    emit('update:visible', false)
    resetForm()
  } catch (error) {
    console.error('添加失败:', error)
    ElMessage.error('添加失败')
  } finally {
    loading.value = false
  }
}

const emit = defineEmits(['success', 'update:visible'])

defineExpose({
  dialogVisible
})
</script> 