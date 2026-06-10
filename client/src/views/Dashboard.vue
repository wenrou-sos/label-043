<template>
  <div>
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-value">{{ stats.totalMembers }}</div>
          <div class="stat-label">会员总数</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-value" style="color: #52c41a;">{{ stats.totalPoints }}</div>
          <div class="stat-label">累计积分</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-value" style="color: #faad14;">{{ stats.totalCoupons }}</div>
          <div class="stat-label">优惠券总数</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-value" style="color: #722ed1;">{{ stats.issuedCoupons }}</div>
          <div class="stat-label">已发放优惠券</div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px;">
      <a-col :span="12">
        <a-card title="会员等级分布">
          <a-table
            :columns="levelColumns"
            :data-source="levels"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'discount'">
                {{ record.discount }}折
              </template>
              <template v-else-if="column.key === 'range'">
                {{ record.min_points }} - {{ record.max_points || '不限' }}
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="最近会员">
          <a-table
            :columns="memberColumns"
            :data-source="recentMembers"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'level'">
                <span :class="['level-badge', `level-${record.level_id}`]">
                  {{ record.level_name || '普通会员' }}
                </span>
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="record.status === 1 ? 'green' : 'red'">
                  {{ record.status === 1 ? '正常' : '禁用' }}
                </a-tag>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="最近积分流水" style="margin-top: 16px;">
      <a-table
        :columns="flowColumns"
        :data-source="recentFlows"
        :pagination="false"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'points'">
            <span :class="record.points > 0 ? 'points-positive' : 'points-negative'">
              {{ record.points > 0 ? '+' : '' }}{{ record.points }}
            </span>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="record.type === 1 ? 'green' : 'orange'">
              {{ record.type === 1 ? '获取' : '消耗' }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMembers, getPointFlows, getLevels, getCoupons } from '@/api';

const stats = ref({
  totalMembers: 0,
  totalPoints: 0,
  totalCoupons: 0,
  issuedCoupons: 0
});

const levels = ref([]);
const recentMembers = ref([]);
const recentFlows = ref([]);

const levelColumns = [
  { title: '等级名称', dataIndex: 'name', key: 'name' },
  { title: '积分范围', key: 'range' },
  { title: '折扣', key: 'discount' },
  { title: '描述', dataIndex: 'description', key: 'description' }
];

const memberColumns = [
  { title: '会员编号', dataIndex: 'member_no', key: 'member_no' },
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '等级', key: 'level' },
  { title: '积分', dataIndex: 'points', key: 'points' },
  { title: '状态', key: 'status' }
];

const flowColumns = [
  { title: '流水号', dataIndex: 'flow_no', key: 'flow_no', width: 140 },
  { title: '会员', dataIndex: 'member_name', key: 'member_name' },
  { title: '积分', key: 'points' },
  { title: '类型', key: 'type' },
  { title: '原因', dataIndex: 'reason', key: 'reason' },
  { title: '时间', dataIndex: 'flow_time', key: 'flow_time' }
];

const loadData = async () => {
  try {
    const [membersData, flowsData, levelsData, couponsData] = await Promise.all([
      getMembers({ page: 1, pageSize: 5 }),
      getPointFlows({ page: 1, pageSize: 8 }),
      getLevels(),
      getCoupons({ page: 1, pageSize: 100 })
    ]);

    stats.value.totalMembers = membersData.total;
    recentMembers.value = membersData.list;
    recentFlows.value = flowsData.list;
    levels.value = levelsData;
    stats.value.totalCoupons = couponsData.total;
    stats.value.issuedCoupons = couponsData.list.reduce((sum, c) => sum + c.used_quantity, 0);
    stats.value.totalPoints = membersData.list.reduce((sum, m) => sum + m.points, 0);
  } catch (error) {
    console.error('加载数据失败:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>
