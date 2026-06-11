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
          <v-chart :option="levelChartOption" style="height: 350px;" autoresize />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="积分流水类型占比（近6个月）">
          <v-chart :option="flowTypeChartOption" style="height: 350px;" autoresize />
        </a-card>
      </a-col>
    </a-row>

    <a-row style="margin-top: 16px;">
      <a-col :span="24">
        <a-card title="每月新增会员趋势（近12个月）">
          <v-chart :option="monthlyChartOption" style="height: 350px;" autoresize />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px;">
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
      <a-col :span="12">
        <a-card title="最近积分流水">
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
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  getMembers, getPointFlows, getCoupons,
  getStatsOverview, getLevelDistribution,
  getMonthlyNewMembers, getPointFlowTypeStats
} from '@/api';

const stats = ref({
  totalMembers: 0,
  totalPoints: 0,
  totalCoupons: 0,
  issuedCoupons: 0
});

const levelDistribution = ref([]);
const monthlyNewMembers = ref([]);
const flowTypeStats = ref([]);
const recentMembers = ref([]);
const recentFlows = ref([]);

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

const levelColors = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96'];

const levelChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center'
  },
  color: levelColors,
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      data: levelDistribution.value.map(item => ({
        value: item.value,
        name: item.level_name
      }))
    }
  ]
}));

const flowTypeChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center'
  },
  color: ['#52c41a', '#fa8c16'],
  series: [
    {
      type: 'pie',
      radius: '60%',
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      data: flowTypeStats.value
    }
  ]
}));

const monthlyChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: '{b}<br/>新增会员: {c}'
  },
  legend: {
    data: ['新增会员']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: monthlyNewMembers.value.map(item => item.month)
  },
  yAxis: {
    type: 'value',
    minInterval: 1
  },
  series: [
    {
      name: '新增会员',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#1890ff'
      },
      itemStyle: {
        color: '#1890ff'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
          ]
        }
      },
      data: monthlyNewMembers.value.map(item => item.value)
    }
  ]
}));

const loadData = async () => {
  try {
    const [
      overview,
      levelData,
      monthlyData,
      flowTypeData,
      membersData,
      flowsData,
      couponsData
    ] = await Promise.all([
      getStatsOverview(),
      getLevelDistribution(),
      getMonthlyNewMembers(),
      getPointFlowTypeStats(),
      getMembers({ page: 1, pageSize: 5 }),
      getPointFlows({ page: 1, pageSize: 8 }),
      getCoupons({ page: 1, pageSize: 100 })
    ]);

    stats.value = {
      totalMembers: overview.totalMembers,
      totalPoints: overview.totalPoints,
      totalCoupons: overview.totalCoupons,
      issuedCoupons: overview.issuedCoupons
    };

    levelDistribution.value = levelData;
    monthlyNewMembers.value = monthlyData;
    flowTypeStats.value = flowTypeData;
    recentMembers.value = membersData.list;
    recentFlows.value = flowsData.list;
  } catch (error) {
    console.error('加载数据失败:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}
</style>
