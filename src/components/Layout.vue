<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { RouterView } from 'vue-router'
import { Moon, Sunny, HomeFilled, InfoFilled, User, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 主题切换
const isDark = ref(false)
const toggleTheme = (): void => {
  isDark.value = !isDark.value
  // 这里可以后续扩展主题切换逻辑
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

// 用户信息
const username = computed(() => {
  return userStore.userInfo?.username || userStore.userInfo?.nickname || '用户'
})

// 退出登录
const handleLogout = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await userStore.logout()
  } catch (error) {
    // 用户取消
  }
}

// 所有可用的导航菜单项（包含权限控制）
const allMenuItems = [
  {
    index: '/',
    title: '首页',
    icon: HomeFilled,
    routeName: 'home',
    // 不需要权限，所有登录用户都可以访问
    requiredPermission: null,
    requiredRole: null
  },
  {
    index: '/about',
    title: '关于',
    icon: InfoFilled,
    routeName: 'about',
    // 不需要权限，所有登录用户都可以访问
    requiredPermission: null,
    requiredRole: null
  }
]

// 根据用户权限过滤后的导航菜单项
const menuItems = computed(() => {
  return allMenuItems.filter(item => {
    // 如果不需要权限，直接显示
    if (!item.requiredPermission && !item.requiredRole) {
      return true
    }
    
    // 检查权限
    if (item.requiredPermission) {
      if (!userStore.hasPermission(item.requiredPermission)) {
        return false
      }
    }
    
    // 检查角色
    if (item.requiredRole) {
      if (!userStore.hasRole(item.requiredRole)) {
        return false
      }
    }
    
    return true
  })
})

// 组件挂载时获取用户信息
onMounted(async () => {
  // 如果已登录但还没有用户信息，则获取
  if (userStore.isLoggedIn && (!userStore.userInfo || userStore.roles.length === 0)) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
})

// 菜单点击处理
const handleMenuSelect = (key: string): void => {
  router.push(key)
}
</script>

<template>
  <el-container class="layout-container">
    <!-- 顶部标题栏 -->
    <el-header class="app-header">
      <div class="header-left">
        <span class="app-title">CitationTree Pro</span>
      </div>
      <div class="header-right">
        <!-- 用户信息 -->
        <el-dropdown trigger="click" class="user-dropdown">
          <div class="user-info">
            <el-icon><User /></el-icon>
            <span class="username">{{ username }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-switch
          v-model="isDark"
          @change="toggleTheme"
          :active-icon="Moon"
          :inactive-icon="Sunny"
          size="large"
          class="theme-switch"
        />
      </div>
    </el-header>

    <el-container class="content-container">
      <!-- 左侧导航栏 -->
      <el-aside width="200px" class="nav-sidebar">
        <el-menu
          :default-active="route.path"
          @select="handleMenuSelect"
          class="nav-menu"
          router
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.index"
            :index="item.index"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧主内容区 -->
      <el-main class="main-content">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* Header 样式 */
.app-header {
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.3s;
  color: #ffffff;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  font-size: 14px;
  font-weight: 500;
}

.theme-switch {
  --el-switch-on-color: #a78bfa;
}

/* 内容容器 */
.content-container {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
}

/* 左侧导航栏样式 */
.nav-sidebar {
  background-color: #ffffff;
  border-right: 1px solid #e9ecef;
  overflow: hidden;
  height: 100%;
  flex-shrink: 0;
}

.nav-menu {
  border-right: none;
  height: 100%;
  width: 100%;
}

/* 右侧主内容区样式 */
.main-content {
  background-color: #ffffff;
  padding: 0;
  margin: 0;
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
