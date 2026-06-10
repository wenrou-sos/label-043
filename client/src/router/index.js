import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '数据概览', icon: 'DashboardOutlined' }
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('@/views/Members.vue'),
    meta: { title: '会员管理', icon: 'UserOutlined' }
  },
  {
    path: '/point-flows',
    name: 'PointFlows',
    component: () => import('@/views/PointFlows.vue'),
    meta: { title: '积分流水', icon: 'SwapOutlined' }
  },
  {
    path: '/levels',
    name: 'Levels',
    component: () => import('@/views/Levels.vue'),
    meta: { title: '等级配置', icon: 'CrownOutlined' }
  },
  {
    path: '/coupons',
    name: 'Coupons',
    component: () => import('@/views/Coupons.vue'),
    meta: { title: '优惠券管理', icon: 'GiftOutlined' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
