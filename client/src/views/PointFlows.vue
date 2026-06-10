<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">积分流水</h2>
    </div>

    <a-card>
      <div class="table-toolbar">
        <a-select
          v-model:value="filterType"
          placeholder="选择类型"
          style="width: 120px;"
          allow-clear
          @change="loadData"
        >
          <a-select-option :value="1">获取</a-select-option>
          <a-select-option :value="2">消耗</a-select-option>
        </a-select>
        <a-range-picker
          v-model:value="dateRange"
          @change="handleDateChange"
        />
        <a-button @click="resetFilter">
          <template #icon><ReloadOutlined /></template>
          重置
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="dataSource.list || []"
        :loading="loading"
        :pagination="{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: dataSource.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: handlePageChange,
          onShowSizeChange: handlePageChange
        }"
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
import { ref, reactive, onMounted } from 'vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import { getPointFlows } from '@/api';
import dayjs from 'dayjs';

const loading = ref(false);
const dataSource = ref({ list: [], total: 0 });
const pagination = reactive({ page: 1, pageSize: 10 });
const filterType = ref(null);
const dateRange = ref([]);
const startDate = ref('');
const endDate = ref('');

const columns = [
  { title: '流水号', dataIndex: 'flow_no', key: 'flow_no', width: 160 },
  { title: '会员编号', dataIndex: 'member_no', key: 'member_no', width: 120 },
  { title: '会员姓名', dataIndex: 'member_name', key: 'member_name', width: 100 },
  { title: '手机号', dataIndex: 'member_phone', key: 'member_phone', width: 130 },
  { title: '积分', key: 'points', width: 100 },
  { title: '类型', key: 'type', width: 80 },
  { title: '变更后余额', dataIndex: 'balance', key: 'balance', width: 120 },
  { title: '原因', dataIndex: 'reason', key: 'reason' },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
  { title: '发生时间', dataIndex: 'flow_time', key: 'flow_time', width: 170 }
];

const loadData = async () => {
  loading.value = true;
  try {
    dataSource.value = await getPointFlows({
      page: pagination.page,
      pageSize: pagination.pageSize,
      type: filterType.value,
      startDate: startDate.value,
      endDate: endDate.value
    });
  } catch (error) {
    console.error('加载失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleDateChange = (dates) => {
  if (dates && dates.length === 2) {
    startDate.value = dayjs(dates[0]).format('YYYY-MM-DD');
    endDate.value = dayjs(dates[1]).format('YYYY-MM-DD');
  } else {
    startDate.value = '';
    endDate.value = '';
  }
  loadData();
};

const handlePageChange = (page, pageSize) => {
  pagination.page = page;
  pagination.pageSize = pageSize;
  loadData();
};

const resetFilter = () => {
  filterType.value = null;
  dateRange.value = [];
  startDate.value = '';
  endDate.value = '';
  pagination.page = 1;
  loadData();
};

onMounted(() => {
  loadData();
});
</script>
