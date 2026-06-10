# 会员积分与等级管理系统

基于 Vue3 + Ant Design Vue + Fastify + MySQL 的会员积分与等级管理系统，支持会员管理、积分流水记录、自动等级升级、优惠券发放与管理等功能。

## 功能特性

### 核心功能
- **会员管理**: 会员信息的增删改查，支持按姓名/手机号搜索
- **积分管理**: 积分的增加/消耗调整，完整的积分流水记录，支持按类型和日期范围筛选
- **等级系统**: 根据积分自动升级会员等级，支持5个默认等级（普通→银卡→金卡→铂金→钻石），各等级享有不同折扣
- **优惠券管理**: 满减券/折扣券的创建、编辑、删除、发放给指定会员，支持使用核销
- **数据概览**: 统计看板展示会员总数、累计积分、优惠券数据等核心指标

### 技术亮点
- 数据库事务保证积分变更、等级升级、流水记录的原子性
- 行级锁防止并发积分变更导致的数据不一致
- 积分变更后自动检测并触发会员等级升级
- 完整的等级升级日志记录

## 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Ant Design Vue** - 企业级 UI 组件库
- **Vue Router** - Vue.js 官方路由
- **Axios** - HTTP 客户端
- **Vite** - 下一代前端构建工具
- **Day.js** - 轻量级日期处理库

### 后端
- **Fastify** - 高性能 Node.js Web 框架
- **MySQL2** - MySQL 数据库驱动（Promise 版本）
- **Dotenv** - 环境变量管理

## 项目结构

```
label-043/
├── package.json              # 根目录 package.json（全局脚本）
├── README.md                 # 项目说明文档
├── server/                   # 后端服务
│   ├── package.json          # 后端依赖
│   ├── .env                  # 环境配置
│   ├── src/
│   │   ├── app.js            # 应用入口
│   │   ├── config/
│   │   │   └── database.js   # 数据库连接配置
│   │   ├── models/           # 数据模型
│   │   │   ├── level.js
│   │   │   ├── member.js
│   │   │   ├── pointFlow.js
│   │   │   └── coupon.js
│   │   └── routes/           # 路由控制器
│   │       ├── levels.js
│   │       ├── members.js
│   │       ├── point-flows.js
│   │       └── coupons.js
│   └── scripts/              # 数据库脚本
│       ├── init-db.js        # 数据库初始化脚本
│       ├── schema.sql        # 建表 SQL
│       └── seed-data.sql     # 初始化数据
└── client/                   # 前端应用
    ├── package.json          # 前端依赖
    ├── vite.config.js        # Vite 配置
    ├── index.html            # HTML 入口
    └── src/
        ├── main.js           # 入口文件
        ├── App.vue           # 根组件
        ├── router/           # 路由配置
        ├── api/              # API 接口
        ├── utils/            # 工具函数
        ├── assets/           # 静态资源
        └── views/            # 页面组件
            ├── Dashboard.vue
            ├── Members.vue
            ├── PointFlows.vue
            ├── Levels.vue
            └── Coupons.vue
```

## 数据库设计

### 核心数据表

| 表名 | 说明 |
|------|------|
| `levels` | 会员等级表（5个等级，积分区间、折扣率） |
| `members` | 会员表（基本信息、当前积分、等级ID、状态） |
| `point_flows` | 积分流水表（每笔积分变更的详细记录） |
| `level_upgrade_logs` | 等级升级日志（记录每次等级变更） |
| `coupons` | 优惠券模板表（优惠券定义、库存、有效期） |
| `member_coupons` | 会员优惠券表（发放给会员的优惠券实例） |

### 默认等级配置

| 等级名称 | 积分范围 | 折扣 |
|----------|----------|------|
| 普通会员 | 0 - 999 | 100折（原价） |
| 银卡会员 | 1000 - 4999 | 95折 |
| 金卡会员 | 5000 - 19999 | 88折 |
| 铂金会员 | 20000 - 49999 | 80折 |
| 钻石会员 | 50000+ | 70折 |

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7 或 >= 8.0
- npm 或 yarn

### 安装步骤

#### 1. 安装依赖

在项目根目录执行：

```bash
npm run install:all
```

或者分别安装：

```bash
# 根目录
npm install

# 后端
cd server
npm install

# 前端
cd ../client
npm install
```

#### 2. 配置数据库

确保 MySQL 服务已启动，然后在 `server/.env` 中确认数据库连接信息：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=member_points
```

#### 3. 初始化数据库

执行以下命令创建数据库、建表并插入初始化数据：

```bash
npm run init:db
```

或在 server 目录下执行：

```bash
cd server
npm run init:db
```

该命令会自动完成：
- 创建 `member_points` 数据库（如果不存在）
- 创建 6 张数据表
- 插入默认等级、示例会员、示例优惠券等初始化数据

#### 4. 启动开发服务

同时启动前端和后端开发服务：

```bash
npm run dev
```

或者分别启动：

```bash
# 启动后端（端口 3001）
npm run dev:server

# 启动前端（端口 5173）
npm run dev:client
```

#### 5. 访问应用

前端地址: http://localhost:5173
后端地址: http://localhost:3001
健康检查: http://localhost:3001/api/health

### 生产部署

```bash
# 安装依赖
npm run install:all

# 初始化数据库（首次部署）
npm run init:db

# 启动生产服务
npm run start
```

## API 接口文档

### 会员接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/members` | 获取会员列表（支持分页、搜索） |
| GET | `/api/members/:id` | 获取会员详情 |
| POST | `/api/members` | 新增会员 |
| PUT | `/api/members/:id` | 更新会员 |
| DELETE | `/api/members/:id` | 删除会员 |
| POST | `/api/members/:id/points` | 调整会员积分 |
| GET | `/api/members/:id/point-flows` | 获取会员积分流水 |

### 积分流水接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/point-flows` | 获取积分流水列表（支持筛选） |

### 等级接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/levels` | 获取所有等级 |
| GET | `/api/levels/:id` | 获取等级详情 |
| POST | `/api/levels` | 新增等级 |
| PUT | `/api/levels/:id` | 更新等级 |
| DELETE | `/api/levels/:id` | 删除等级 |

### 优惠券接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/coupons` | 获取优惠券列表 |
| GET | `/api/coupons/:id` | 获取优惠券详情 |
| POST | `/api/coupons` | 新增优惠券 |
| PUT | `/api/coupons/:id` | 更新优惠券 |
| DELETE | `/api/coupons/:id` | 删除优惠券 |
| POST | `/api/coupons/:id/issue` | 发放优惠券给会员 |
| GET | `/api/coupons/member/:memberId` | 获取会员的优惠券 |
| POST | `/api/coupons/use/:memberCouponId` | 使用优惠券 |

## 脚本说明

| 脚本 | 说明 |
|------|------|
| `npm run install:all` | 安装所有依赖（根目录+后端+前端） |
| `npm run init:db` | 初始化数据库（建表+插入初始化数据） |
| `npm run dev` | 同时启动前端和后端开发服务 |
| `npm run dev:server` | 启动后端开发服务 |
| `npm run dev:client` | 启动前端开发服务 |
| `npm run start` | 启动生产服务（构建前端+启动前后端） |

## 测试数据说明

数据库初始化后会插入以下测试数据：

- **5 个等级**: 普通会员、银卡会员、金卡会员、铂金会员、钻石会员
- **5 位会员**: 张三（银卡）、李四（金卡）、王五（普通）、赵六（铂金）、孙七（冻结）
- **10 条积分流水**: 包含消费获得、活动赠送、积分兑换等场景
- **5 张优惠券模板**: 新会员券、会员日8折券、满减券等
- **8 张已发放优惠券**: 部分已使用，部分未使用

## 注意事项

1. **数据库密码**: 默认使用 `password`，如需修改请编辑 `server/.env` 文件
2. **端口占用**: 默认使用 3001（后端）和 5173（前端），如端口被占用请修改配置
3. **数据备份**: 操作前请备份重要数据，删除操作不可恢复
4. **并发安全**: 积分变更操作已使用数据库事务和行级锁保证数据一致性

## 开发说明

### 后端开发规范
- 所有 API 响应统一格式: `{ code: 0, message: 'success', data: {...} }`
- `code: 0` 表示成功，非 0 表示失败
- 数据库操作使用参数化查询，防止 SQL 注入
- 涉及多表变更的操作使用事务保证原子性

### 前端开发规范
- 使用 Vue 3 Composition API + `<script setup>` 语法
- API 请求统一封装在 `src/api/index.js`
- 全局样式在 `src/assets/main.css`
- 路由配置在 `src/router/index.js`

## License

MIT
