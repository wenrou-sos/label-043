<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">优惠券管理</h2>
      <a-button type="primary" @click="openAddModal">
        <template #icon><PlusOutlined /></template>
        新增优惠券
      </a-button>
    </div>

    <a-card>
      <div class="table-toolbar">
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索优惠券名称/编码"
          style="width: 250px;"
          @search="loadData"
        />
        <a-select
          v-model:value="filterStatus"
          placeholder="选择状态"
          style="width: 120px;"
          allow-clear
          @change="loadData"
        >
          <a-select-option :value="1">启用</a-select-option>
          <a-select-option :value="0">停用</a-select-option>
        </a-select>
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
          <template v-if="column.key === 'type'">
            {{ record.type === 1 ? '满减券' : '折扣券' }}
          </template>
          <template v-else-if="column.key === 'value'">
            <span v-if="record.type === 1">¥{{ record.value }}</span>
            <span v-else>{{ record.value }}折</span>
          </template>
          <template v-else-if="column.key === 'progress'">
            <a-progress
              :percent="Math.round((record.used_quantity / record.total_quantity) * 100)"
              :show-info="false"
              size="small"
            />
            <div style="font-size: 12px; color: #666;">
              {{ record.used_quantity }}/{{ record.total_quantity }}
            </div>
          </template>
          <template v-else-if="column.key === 'validity'">
            {{ record.start_date }} ~ {{ record.end_date }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '启用' : '停用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openIssueModal(record)">发放</a-button>
              <a-button type="link" size="small" @click="openEditModal(record)">编辑</a-button>
              <a-popconfirm title="确定删除该优惠券吗？" @confirm="handleDelete(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑优惠券' : '新增优惠券'"
      width="600px"
      @ok="handleSubmit"
      @cancel="modalVisible = false"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="优惠券名称" required>
          <a-input v-model:value="formData.name" placeholder="请输入优惠券名称" />
        </a-form-item>
        <a-form-item label="优惠券编码">
          <a-input v-model:value="formData.code" placeholder="留空自动生成" />
        </a-form-item>
        <a-form-item label="类型" required>
          <a-select v-model:value="formData.type">
            <a-select-option :value="1">满减券</a-select-option>
            <a-select-option :value="2">折扣券</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="面值" required>
          <a-input-number
            v-model:value="formData.value"
            :min="0"
            :step="formData.type === 1 ? 1 : 0.1"
            style="width: 100%;"
            :placeholder="formData.type === 1 ? '请输入减免金额' : '请输入折扣率(如80表示8折)'"
          />
        </a-form-item>
        <a-form-item label="最低消费">
          <a-input-number
            v-model:value="formData.min_amount"
            :min="0"
            style="width: 100%;"
            placeholder="0表示无限制"
          />
        </a-form-item>
        <a-form-item label="发放数量" required>
          <a-input-number
            v-model:value="formData.total_quantity"
            :min="1"
            style="width: 100%;"
            placeholder="请输入发放总数量"
          />
        </a-form-item>
        <a-form-item label="有效期" required>
          <a-range-picker
            v-model:value="dateRange"
            style="width: 100%;"
            @change="handleDateRangeChange"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="formData.status">
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">停用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="使用说明">
          <a-textarea v-model:value="formData.description" placeholder="请输入使用说明" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="issueModalVisible"
      title="发放优惠券"
      width="500px"
      @ok="handleIssueSubmit"
      @cancel="issueModalVisible = false"
    >
      <a-descriptions :column="1" size="small" style="margin-bottom: 16px;">
        <a-descriptions-item label="优惠券">{{ currentCoupon?.name }}</a-descriptions-item>
        <a-descriptions-item label="类型">
          {{ currentCoupon?.type === 1 ? '满减券' : '折扣券' }}
        </a-descriptions-item>
        <a-descriptions-item label="面值">
          <span v-if="currentCoupon?.type === 1">¥{{ currentCoupon?.value }}</span>
          <span v-else>{{ currentCoupon?.value }}折</span>
        </a-descriptions-item>
        <a-descriptions-item label="剩余数量">
          {{ (currentCoupon?.total_quantity || 0) - (currentCoupon?.used_quantity || 0) }}张
        </a-descriptions-item>
      </a-descriptions>
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="选择会员" required>
          <a-select
            v-model:value="selectedMemberId"
            show-search
            placeholder="搜索会员姓名/手机号"
            :filter-option="false"
            @search="handleMemberSearch"
          >
            <a-select-option
              v-for="member in memberOptions"
              :key="member.id"
              :value="member.id"
            >
              {{ member.name }} - {{ member.phone }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="操作人">
          <a-input v-model:value="issueForm.operator" placeholder="请输入操作人" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import {
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
  issueCoupon, getMembers
} from '@/api';
import dayjs from 'dayjs';

const loading = ref(false);
const keyword = ref('');
const filterStatus = ref(null);
const dataSource = ref({ list: [], total: 0 });
const pagination = reactive({ page: 1, pageSize: 10 });

const modalVisible = ref(false);
const isEdit = ref(false);
const editingId = ref(null);
const dateRange = ref([]);
const formData = reactive({
  name: '', code: '', type: 1, value: null, min_amount: 0,
  total_quantity: 100, start_date: '', end_date: '', status: 1, description: ''
});

const issueModalVisible = ref(false);
const currentCoupon = ref(null);
const selectedMemberId = ref(null);
const memberOptions = ref([]);
const issueForm = reactive({ operator: 'admin' });

const columns = [
  { title: '编码', dataIndex: 'code', key: 'code', width: 100 },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '类型', key: 'type', width: 80 },
  { title: '面值', key: 'value', width: 100 },
  { title: '最低消费', dataIndex: 'min_amount', key: 'min_amount', width: 100 },
  { title: '发放进度', key: 'progress', width: 140 },
  { title: '有效期', key: 'validity', width: 220 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 170 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
];

const loadData = async () => {
  loading.value = true;
  try {
    dataSource.value = await getCoupons({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: filterStatus.value,
      keyword: keyword.value
    });
  } catch (error) {
    console.error('加载失败:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page, pageSize) => {
  pagination.page = page;
  pagination.pageSize = pageSize;
  loadData();
};

const resetFilter = () => {
  keyword.value = '';
  filterStatus.value = null;
  pagination.page = 1;
  loadData();
};

const resetForm = () => {
  Object.assign(formData, {
    name: '', code: '', type: 1, value: null, min_amount: 0,
    total_quantity: 100, start_date: '', end_date: '', status: 1, description: ''
  });
  dateRange.value = [];
  selectedMemberId.value = null;
  Object.assign(issueForm, { operator: 'admin' });
};

const openAddModal = () => {
  resetForm();
  isEdit.value = false;
  editingId.value = null;
  modalVisible.value = true;
};

const openEditModal = (record) => {
  resetForm();
  isEdit.value = true;
  editingId.value = record.id;
  Object.assign(formData, {
    name: record.name,
    code: record.code,
    type: record.type,
    value: record.value,
    min_amount: record.min_amount,
    total_quantity: record.total_quantity,
    start_date: record.start_date,
    end_date: record.end_date,
    status: record.status,
    description: record.description
  });
  dateRange.value = [dayjs(record.start_date), dayjs(record.end_date)];
  modalVisible.value = true;
};

const handleDateRangeChange = (dates) => {
  if (dates && dates.length === 2) {
    formData.start_date = dayjs(dates[0]).format('YYYY-MM-DD');
    formData.end_date = dayjs(dates[1]).format('YYYY-MM-DD');
  }
};

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await updateCoupon(editingId.value, formData);
      message.success('更新成功');
    } else {
      await createCoupon(formData);
      message.success('创建成功');
    }
    modalVisible.value = false;
    loadData();
  } catch (error) {
    console.error('提交失败:', error);
  }
};

const handleDelete = async (id) => {
  try {
    await deleteCoupon(id);
    message.success('删除成功');
    loadData();
  } catch (error) {
    console.error('删除失败:', error);
  }
};

const openIssueModal = async (record) => {
  resetForm();
  currentCoupon.value = record;
  try {
    const result = await getMembers({ page: 1, pageSize: 100 });
    memberOptions.value = result.list;
    issueModalVisible.value = true;
  } catch (error) {
    console.error('加载会员失败:', error);
  }
};

const handleMemberSearch = async (value) => {
  if (value) {
    const result = await getMembers({ page: 1, pageSize: 100, keyword: value });
    memberOptions.value = result.list;
  }
};

const handleIssueSubmit = async () => {
  if (!selectedMemberId.value) {
    message.warning('请选择会员');
    return;
  }
  try {
    await issueCoupon(currentCoupon.value.id, {
      memberId: selectedMemberId.value,
      operator: issueForm.operator
    });
    message.success('发放成功');
    issueModalVisible.value = false;
    loadData();
  } catch (error) {
    console.error('发放失败:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>
