<template>
  <a-layout class="layout-container">
    <a-layout-sider v-model:collapsed="collapsed" collapsible theme="dark">
      <div class="logo">🎁 会员管理系统</div>
      <a-menu
        theme="dark"
        mode="inline"
        :selected-keys="[$route.path]"
        @click="handleMenuClick"
      >
        <a-menu-item key="/dashboard">
          <template #icon><DashboardOutlined /></template>
          <span>数据概览</span>
        </a-menu-item>
        <a-menu-item key="/members">
          <template #icon><UserOutlined /></template>
          <span>会员管理</span>
        </a-menu-item>
        <a-menu-item key="/point-flows">
          <template #icon><SwapOutlined /></template>
          <span>积分流水</span>
        </a-menu-item>
        <a-menu-item key="/levels">
          <template #icon><CrownOutlined /></template>
          <span>等级配置</span>
        </a-menu-item>
        <a-menu-item key="/coupons">
          <template #icon><GiftOutlined /></template>
          <span>优惠券管理</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="font-size: 16px; font-weight: 500;">{{ $route.meta.title }}</div>
      </a-layout-header>
      <a-layout-content style="margin: 16px;">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { DashboardOutlined, UserOutlined, SwapOutlined, CrownOutlined, GiftOutlined } from '@ant-design/icons-vue';

const router = useRouter();
const collapsed = ref(false);

const handleMenuClick = ({ key }) => {
  router.push(key);
};
</script>
