import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        requiresAuth: false // 登录页不需要认证
      }
    },
    {
      path: '/',
      component: Layout,
      meta: {
        requiresAuth: true // 需要登录
      },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
          meta: {
            requiresAuth: true
          }
        },
      ],
    },
  ],
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // 如果目标路由需要登录
  if (requiresAuth) {
    // 检查用户是否已登录
    if (!userStore.isLoggedIn) {
      // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存原始路径，登录后可以跳转回去
      })
    } else {
      // 已登录，检查是否需要获取用户信息（包括权限）
      if (!userStore.userInfo || userStore.roles.length === 0) {
        try {
          await userStore.fetchUserInfo()
        } catch (error) {
          console.error('获取用户信息失败:', error)
          // 如果获取失败，可能是 token 失效，清除数据并跳转到登录页
          userStore.clearUserData()
          next({
            path: '/login',
            query: { redirect: to.fullPath }
          })
          return
        }
      }
      // 允许访问
      next()
    }
  } else {
    // 如果目标路由不需要登录（如登录页）
    if (to.path === '/login' && userStore.isLoggedIn) {
      // 如果已登录，访问登录页时重定向到首页
      next('/')
    } else {
      // 允许访问
      next()
    }
  }
})

export default router
