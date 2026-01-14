# Citation Tree UI

基于 Vue 3 + TypeScript + Vite 的现代化前端项目脚手架，集成了完整的用户认证、权限管理、状态管理等企业级功能。

## ✨ 特性

- 🚀 **Vue 3** - 使用 Composition API 和 `<script setup>` 语法
- 📘 **TypeScript** - 完整的类型支持，提供更好的开发体验
- ⚡️ **Vite** - 极速的开发服务器和构建工具
- 🎨 **Element Plus** - 基于 Vue 3 的组件库
- 📊 **ECharts** - 强大的数据可视化图表库
- 🔐 **用户认证** - 完整的登录、注册、注销功能
- 🛡️ **权限管理** - 基于角色的访问控制（RBAC）
- 📦 **Pinia** - 新一代 Vue 状态管理库
- 🛣️ **Vue Router** - 官方路由管理器，支持路由守卫
- 🔧 **Axios** - HTTP 请求库，包含请求/响应拦截器
- 🎯 **代码规范** - ESLint + Prettier 代码格式化

## 📋 环境要求

- **Node.js**: `^20.19.0 || >=22.12.0`
- **npm**: `>=9.0.0` 或 `yarn` 或 `pnpm`

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动后访问 [http://localhost:5173](http://localhost:5173)

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

### 类型检查

```bash
npm run type-check
```

### 代码检查与修复

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 📁 项目结构

```
citation-tree-ui/
├── public/                 # 静态资源目录
│   └── favicon.ico        # 网站图标
├── src/
│   ├── api/               # API 接口定义
│   │   ├── auth.ts        # 认证相关接口
│   │   └── paper.ts       # 业务接口示例
│   ├── assets/            # 资源文件
│   │   ├── base.css       # 基础样式
│   │   ├── main.css       # 主样式
│   │   └── logo.svg       # Logo
│   ├── components/        # 公共组件
│   │   ├── Layout.vue     # 布局组件
│   │   ├── PaperSidebar.vue # 侧边栏组件
│   │   ├── CitationTree.vue # 业务组件示例
│   │   └── icons/         # 图标组件
│   ├── router/            # 路由配置
│   │   └── index.ts       # 路由定义和守卫
│   ├── stores/            # Pinia 状态管理
│   │   ├── user.ts        # 用户状态
│   │   ├── paper.ts       # 业务状态示例
│   │   └── counter.ts     # 示例状态
│   ├── utils/             # 工具函数
│   │   └── request.ts     # Axios 封装
│   ├── views/             # 页面组件
│   │   ├── HomeView.vue   # 首页
│   │   ├── LoginView.vue  # 登录页
│   │   └── AboutView.vue  # 关于页
│   ├── App.vue            # 根组件
│   └── main.ts            # 应用入口
├── .eslintrc.cjs          # ESLint 配置
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── README.md              # 项目说明
```

## 🔧 配置说明

### API 代理配置

开发环境下，所有 `/api` 开头的请求会被代理到后端服务器。配置位于 `vite.config.ts`：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false
    }
  }
}
```

如需修改后端地址，请编辑 `vite.config.ts` 中的 `target` 字段。

### 环境变量

项目支持通过环境变量进行配置。创建 `.env` 文件（开发环境）或 `.env.production` 文件（生产环境）：

```env
# API 基础路径
VITE_API_BASE_URL=/api

# 应用标题
VITE_APP_TITLE=Citation Tree UI
```

### Token 存储

项目使用 `localStorage` 存储用户 Token，键名为 `satoken`。如需修改，请编辑 `src/stores/user.ts` 中的 `TOKEN_KEY` 常量。

## 🎯 核心功能

### 用户认证

项目已集成完整的用户认证系统：

- **登录** (`/login`): 用户登录页面
- **注册**: 用户注册功能（可在登录页扩展）
- **注销**: 用户登出功能
- **Token 管理**: 自动在请求头中添加 Token
- **自动跳转**: 未登录用户访问受保护路由时自动跳转到登录页

### 路由守卫

路由守卫位于 `src/router/index.ts`，实现了以下功能：

- 检查路由是否需要认证（`meta.requiresAuth`）
- 未登录用户自动跳转到登录页
- 已登录用户访问登录页自动跳转到首页
- Token 失效时自动清除数据并跳转

### 状态管理

使用 Pinia 进行状态管理，主要 Store：

- **user.ts**: 用户信息、Token、角色、权限
- **paper.ts**: 业务数据示例

### HTTP 请求

Axios 封装位于 `src/utils/request.ts`，包含：

- 请求拦截器：自动添加 Token
- 响应拦截器：统一处理错误和响应数据
- 错误处理：401 自动跳转登录，其他错误统一提示

### API 接口

API 接口定义在 `src/api/` 目录下：

- **auth.ts**: 认证相关接口（登录、注册、注销、获取用户信息）
- **paper.ts**: 业务接口示例

## 🛠️ 开发指南

### 添加新页面

1. 在 `src/views/` 目录下创建新的 Vue 组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 如需权限控制，在路由的 `meta` 中添加 `requiresAuth: true`

示例：

```typescript
{
  path: '/new-page',
  name: 'new-page',
  component: () => import('../views/NewPageView.vue'),
  meta: {
    requiresAuth: true
  }
}
```

### 添加新 API 接口

1. 在 `src/api/` 目录下创建或编辑对应的 API 文件
2. 使用 `request` 工具发送请求

示例：

```typescript
import request from '@/utils/request'

export interface NewData {
  id: number
  name: string
}

export const getNewData = (): Promise<NewData[]> => {
  return request.get<NewData[]>('/new-data')
}
```

### 添加新的 Store

1. 在 `src/stores/` 目录下创建新的 Store 文件
2. 使用 `defineStore` 定义 Store

示例：

```typescript
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNewStore = defineStore('new', () => {
  const data = ref<string>('')
  
  function setData(value: string) {
    data.value = value
  }
  
  return { data, setData }
})
```

### 使用 Element Plus 组件

项目已全局注册 Element Plus，可以直接使用：

```vue
<template>
  <el-button type="primary">按钮</el-button>
  <el-input v-model="input" placeholder="请输入" />
</template>
```

### 使用 ECharts

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLDivElement>()

onMounted(() => {
  const chart = echarts.init(chartRef.value!)
  chart.setOption({
    // 图表配置
  })
})
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 400px;"></div>
</template>
```

## 📦 依赖说明

### 生产依赖

- `vue` - Vue 3 框架
- `vue-router` - 路由管理
- `pinia` - 状态管理
- `element-plus` - UI 组件库
- `@element-plus/icons-vue` - Element Plus 图标
- `axios` - HTTP 请求库
- `echarts` - 图表库

### 开发依赖

- `typescript` - TypeScript 支持
- `vite` - 构建工具
- `@vitejs/plugin-vue` - Vue 插件
- `vue-tsc` - Vue TypeScript 类型检查
- `eslint` - 代码检查
- `prettier` - 代码格式化

## 🔍 IDE 推荐配置

### VS Code

推荐安装以下插件：

- [Vue Language Features (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 3 官方插件
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) - TypeScript 支持
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - 代码检查
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - 代码格式化

**注意**: 如果安装了 Vetur，请禁用它，因为它与 Volar 冲突。

### 浏览器扩展

推荐安装 Vue DevTools：

- **Chrome/Edge**: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

## 🐛 常见问题

### 1. 端口被占用

如果 5173 端口被占用，Vite 会自动尝试其他端口。也可以手动指定端口：

```bash
npm run dev -- --port 3000
```

### 2. API 请求失败

- 检查后端服务是否启动
- 检查 `vite.config.ts` 中的代理配置是否正确
- 检查浏览器控制台的错误信息

### 3. TypeScript 类型错误

运行类型检查：

```bash
npm run type-check
```

### 4. 登录后 Token 未保存

检查浏览器控制台是否有错误，确认 `localStorage` 是否可用。

## 📝 代码规范

项目使用 ESLint 和 Prettier 进行代码规范检查：

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化

运行 `npm run lint` 可以自动修复大部分问题。

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题，请通过 Issue 反馈。

---

**Happy Coding! 🎉**
