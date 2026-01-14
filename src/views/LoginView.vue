<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { LoginDTO, RegisterDTO } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 登录/注册切换
const isLogin = ref(true)

// 登录表单
const loginForm = reactive<LoginDTO>({
  username: '',
  password: ''
})

// 注册表单
const registerForm = reactive<RegisterDTO>({
  username: '',
  password: '',
  nickname: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 64, message: '用户名长度必须在4-64个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度必须在6-32个字符之间', trigger: 'blur' }
  ]
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 64, message: '用户名长度必须在4-64个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度必须在6-32个字符之间', trigger: 'blur' }
  ],
  nickname: [
    { max: 64, message: '昵称长度不能超过64个字符', trigger: 'blur' }
  ]
}

// 表单引用
const loginFormRef = ref()
const registerFormRef = ref()

// 加载状态
const loginLoading = ref(false)
const registerLoading = ref(false)

// 切换登录/注册
const toggleMode = (): void => {
  isLogin.value = !isLogin.value
  // 重置表单
  if (loginFormRef.value) {
    loginFormRef.value.resetFields()
  }
  if (registerFormRef.value) {
    registerFormRef.value.resetFields()
  }
}

// 登录
const handleLogin = async (): Promise<void> => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    loginLoading.value = true
    try {
      await userStore.login(loginForm)
      ElMessage.success('登录成功')
      
      // 跳转到原始页面或首页
      const redirect = route.query.redirect as string || '/'
      router.push(redirect)
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || '登录失败，请重试'
      ElMessage.error(message)
    } finally {
      loginLoading.value = false
    }
  })
}

// 注册
const handleRegister = async (): Promise<void> => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    registerLoading.value = true
    try {
      await userStore.register(registerForm)
      ElMessage.success('注册成功，已自动登录')
      
      // 跳转到原始页面或首页
      const redirect = route.query.redirect as string || '/'
      router.push(redirect)
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || '注册失败，请重试'
      ElMessage.error(message)
    } finally {
      registerLoading.value = false
    }
  })
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <!-- Logo 和标题 -->
      <div class="login-header">
        <h1 class="login-title">CitationTree Pro</h1>
        <p class="login-subtitle">高效论文阅读平台</p>
      </div>

      <!-- 登录表单 -->
      <div v-if="isLogin" class="form-container">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="0"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              size="large"
              prefix-icon="User"
              clearable
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="large"
              prefix-icon="Lock"
              show-password
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loginLoading"
              @click="handleLogin"
              class="submit-button"
            >
              {{ loginLoading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
        <div class="form-footer">
          <span class="toggle-text">还没有账号？</span>
          <el-link type="primary" @click="toggleMode" class="toggle-link">立即注册</el-link>
        </div>
      </div>

      <!-- 注册表单 -->
      <div v-else class="form-container">
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-width="0"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="用户名（4-64个字符）"
              size="large"
              prefix-icon="User"
              clearable
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="密码（6-32个字符）"
              size="large"
              prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>
          <el-form-item prop="nickname">
            <el-input
              v-model="registerForm.nickname"
              placeholder="昵称（可选）"
              size="large"
              prefix-icon="UserFilled"
              clearable
              @keyup.enter="handleRegister"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="registerLoading"
              @click="handleRegister"
              class="submit-button"
            >
              {{ registerLoading ? '注册中...' : '注册' }}
            </el-button>
          </el-form-item>
        </el-form>
        <div class="form-footer">
          <span class="toggle-text">已有账号？</span>
          <el-link type="primary" @click="toggleMode" class="toggle-link">立即登录</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

.form-container {
  width: 100%;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e9ecef inset;
  transition: all 0.3s;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #8b5cf6 inset;
}

.login-form :deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #8b5cf6 inset;
}

.submit-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
  border: none;
  transition: all 0.3s;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.submit-button:active {
  transform: translateY(0);
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #6c757d;
}

.toggle-text {
  margin-right: 8px;
}

.toggle-link {
  font-weight: 500;
  text-decoration: none;
}

.toggle-link:hover {
  text-decoration: underline;
}
</style>
