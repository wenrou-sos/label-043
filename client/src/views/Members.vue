<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">会员管理</h2>
      <a-button type="primary" @click="openAddModal">
        <template #icon><PlusOutlined /></template>
        新增会员
      </a-button>
    </div>

    <a-card>
      <div class="table-toolbar">
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索会员姓名/手机号"
          style="width: 250px;"
          @search="loadData"
        />
        <a-button @click="loadData">
          <template #icon><ReloadOutlined /></template>
          刷新
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
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetail(record)">查看</a-button>
              <a-button type="link" size="small" @click="openEditModal(record)">编辑</a-button>
              <a-button type="link" size="small" @click="openPointsModal(record)">积分调整</a-button>
              <a-button type="link" size="small" @click="openCouponModal(record)">发放优惠券</a-button>
              <a-popconfirm title="确定删除该会员吗？" @confirm="handleDelete(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑会员' : '新增会员'"
      width="500px"
      @ok="handleSubmit"
      @cancel="handleMemberCancel"
      :confirm-loading="memberSubmitting"
    >
      <a-form
        ref="memberFormRef"
        :model="formData"
        :rules="memberRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="姓名" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入会员姓名" />
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="formData.phone" placeholder="请输入手机号码" />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="formData.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select v-model:value="formData.status">
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="formData.remark" placeholder="请输入备注" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="pointsModalVisible"
      title="积分调整"
      width="500px"
      @ok="handlePointsSubmit"
      @cancel="pointsModalVisible = false"
      :confirm-loading="pointsSubmitting"
    >
      <a-descriptions :column="1" size="small" style="margin-bottom: 16px;">
        <a-descriptions-item label="会员">{{ currentMember?.name }}</a-descriptions-item>
        <a-descriptions-item label="当前积分">{{ currentMember?.points }}</a-descriptions-item>
        <a-descriptions-item label="当前等级">{{ currentMember?.level_name }}</a-descriptions-item>
      </a-descriptions>
      <a-form
        ref="pointsFormRef"
        :model="pointsForm"
        :rules="pointsRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="调整类型" name="type">
          <a-select v-model:value="pointsForm.type">
            <a-select-option :value="1">增加积分</a-select-option>
            <a-select-option :value="2">减少积分</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="积分数量" name="points">
          <a-input-number
            v-model:value="pointsForm.points"
            :min="1"
            :max="999999"
            style="width: 100%;"
            placeholder="请输入积分数量"
          />
        </a-form-item>
        <a-form-item label="调整原因" name="reason">
          <a-textarea v-model:value="pointsForm.reason" placeholder="请输入调整原因" :rows="3" />
        </a-form-item>
        <a-form-item label="操作人" name="operator">
          <a-input v-model:value="pointsForm.operator" placeholder="请输入操作人" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="couponModalVisible"
      title="发放优惠券"
      width="600px"
      @ok="handleCouponSubmit"
      @cancel="couponModalVisible = false"
    >
      <a-descriptions :column="1" size="small" style="margin-bottom: 16px;">
        <a-descriptions-item label="会员">{{ currentMember?.name }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ currentMember?.phone }}</a-descriptions-item>
      </a-descriptions>
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="选择优惠券" required>
          <a-select v-model:value="selectedCouponId" placeholder="请选择要发放的优惠券">
            <a-select-option
              v-for="coupon in availableCoupons"
              :key="coupon.id"
              :value="coupon.id"
              :disabled="coupon.used_quantity >= coupon.total_quantity"
            >
              {{ coupon.name }} - {{ coupon.type === 1 ? `满${coupon.min_amount}减${coupon.value}` : `${coupon.value}折` }}
              (剩余: {{ coupon.total_quantity - coupon.used_quantity }}张)
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="操作人">
          <a-input v-model:value="couponForm.operator" placeholder="请输入操作人" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="detailModalVisible"
      title="会员详情"
      width="700px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px;">
        <a-descriptions-item label="会员编号">{{ currentMember?.member_no }}</a-descriptions-item>
        <a-descriptions-item label="姓名">{{ currentMember?.name }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ currentMember?.phone }}</a-descriptions-item>
        <a-descriptions-item label="邮箱">{{ currentMember?.email || '-' }}</a-descriptions-item>
        <a-descriptions-item label="当前积分">{{ currentMember?.points }}</a-descriptions-item>
        <a-descriptions-item label="等级">
          <span :class="['level-badge', `level-${currentMember?.level_id}`]">
            {{ currentMember?.level_name || '普通会员' }}
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="折扣">{{ currentMember?.level_discount || 100 }}折</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="currentMember?.status === 1 ? 'green' : 'red'">
            {{ currentMember?.status === 1 ? '正常' : '禁用' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="注册时间">{{ currentMember?.created_at }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ currentMember?.updated_at }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentMember?.remark || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-tabs v-model:activeKey="activeDetailTab">
        <a-tab-pane key="flows" tab="积分流水">
          <a-table
            :columns="flowColumns"
            :data-source="memberFlows.list || []"
            :pagination="{
              current: flowPagination.page,
              pageSize: flowPagination.pageSize,
              total: memberFlows.total || 0,
              onChange: handleFlowPageChange
            }"
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
        </a-tab-pane>
        <a-tab-pane key="coupons" tab="优惠券">
          <a-table
            :columns="couponColumns"
            :data-source="memberCoupons.list || []"
            :pagination="{
              current: couponPagination.page,
              pageSize: couponPagination.pageSize,
              total: memberCoupons.total || 0,
              onChange: handleCouponPageChange
            }"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'type'">
                {{ record.type === 1 ? `满${record.min_amount}减${record.value}` : `${record.value}折` }}
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="record.status === 0 ? 'blue' : record.status === 1 ? 'green' : 'red'">
                  {{ record.status === 0 ? '未使用' : record.status === 1 ? '已使用' : '已过期' }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button
                  v-if="record.status === 0"
                  type="link"
                  size="small"
                  @click="handleUseCoupon(record)"
                >
                  使用
                </a-button>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import {
  getMembers, createMember, updateMember, deleteMember,
  updateMemberPoints, getMemberPointFlows,
  getCoupons, issueCoupon, getMemberCoupons, useCoupon, getMember
} from '@/api';

const loading = ref(false);
const keyword = ref('');
const dataSource = ref({ list: [], total: 0 });
const pagination = reactive({ page: 1, pageSize: 10 });

const modalVisible = ref(false);
const isEdit = ref(false);
const editingId = ref(null);
const memberFormRef = ref(null);
const memberSubmitting = ref(false);
const formData = reactive({
  name: '', phone: '', email: '', status: 1, remark: ''
});
const memberRules = {
  name: [
    { required: true, message: '请输入会员姓名', trigger: 'blur' },
    { max: 50, message: '姓名最多50个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
};

const pointsModalVisible = ref(false);
const pointsFormRef = ref(null);
const pointsSubmitting = ref(false);
const pointsForm = reactive({ type: 1, points: null, reason: '', operator: 'admin' });
const pointsRules = {
  type: [{ required: true, message: '请选择调整类型', trigger: 'change' }],
  points: [{ required: true, message: '请输入积分数量', trigger: 'blur' }],
  reason: [
    { required: true, message: '请输入调整原因', trigger: 'blur' },
    { max: 255, message: '原因最多255个字符', trigger: 'blur' }
  ]
};

const couponModalVisible = ref(false);
const selectedCouponId = ref(null);
const availableCoupons = ref([]);
const couponForm = reactive({ operator: 'admin' });

const detailModalVisible = ref(false);
const currentMember = ref(null);
const activeDetailTab = ref('flows');

const memberFlows = ref({ list: [], total: 0 });
const flowPagination = reactive({ page: 1, pageSize: 10 });

const memberCoupons = ref({ list: [], total: 0 });
const couponPagination = reactive({ page: 1, pageSize: 10 });

const columns = [
  { title: '会员编号', dataIndex: 'member_no', key: 'member_no', width: 120 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '积分', dataIndex: 'points', key: 'points', width: 80 },
  { title: '等级', key: 'level', width: 100 },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 170 },
  { title: '操作', key: 'action', fixed: 'right', width: 280 }
];

const flowColumns = [
  { title: '流水号', dataIndex: 'flow_no', key: 'flow_no' },
  { title: '积分', key: 'points', width: 80 },
  { title: '类型', key: 'type', width: 80 },
  { title: '余额', dataIndex: 'balance', key: 'balance', width: 80 },
  { title: '原因', dataIndex: 'reason', key: 'reason' },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
  { title: '时间', dataIndex: 'flow_time', key: 'flow_time', width: 170 }
];

const couponColumns = [
  { title: '券码', dataIndex: 'code', key: 'code' },
  { title: '优惠券名称', dataIndex: 'name', key: 'name' },
  { title: '类型', key: 'type' },
  { title: '有效期', key: 'valid', render: (_, r) => `${r.valid_from} ~ ${r.valid_to}` },
  { title: '状态', key: 'status', width: 80 },
  { title: '发放时间', dataIndex: 'issued_at', key: 'issued_at', width: 170 },
  { title: '操作', key: 'action', width: 80 }
];

const loadData = async () => {
  loading.value = true;
  try {
    dataSource.value = await getMembers({
      page: pagination.page,
      pageSize: pagination.pageSize,
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

const resetForm = () => {
  Object.assign(formData, { name: '', phone: '', email: '', status: 1, remark: '' });
  Object.assign(pointsForm, { type: 1, points: null, reason: '', operator: 'admin' });
  Object.assign(couponForm, { operator: 'admin' });
  selectedCouponId.value = null;
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
    phone: record.phone,
    email: record.email,
    status: record.status,
    remark: record.remark
  });
  modalVisible.value = true;
};

const handleMemberCancel = () => {
  memberFormRef.value?.clearValidate();
  modalVisible.value = false;
};

const handleSubmit = async () => {
  try {
    await memberFormRef.value.validate();
  } catch (error) {
    message.warning('请完善必填项');
    return;
  }

  memberSubmitting.value = true;
  try {
    if (isEdit.value) {
      await updateMember(editingId.value, formData);
      message.success('更新成功');
    } else {
      await createMember(formData);
      message.success('创建成功');
    }
    modalVisible.value = false;
    memberFormRef.value?.clearValidate();
    loadData();
  } catch (error) {
    console.error('提交失败:', error);
  } finally {
    memberSubmitting.value = false;
  }
};

const handleDelete = async (id) => {
  try {
    await deleteMember(id);
    message.success('删除成功');
    loadData();
  } catch (error) {
    console.error('删除失败:', error);
  }
};

const openPointsModal = (record) => {
  resetForm();
  currentMember.value = record;
  pointsModalVisible.value = true;
};

const handlePointsSubmit = async () => {
  try {
    await pointsFormRef.value.validate();
  } catch (error) {
    message.warning('请完善必填项');
    return;
  }

  pointsSubmitting.value = true;
  try {
    const points = pointsForm.type === 1 ? pointsForm.points : -pointsForm.points;
    await updateMemberPoints(currentMember.value.id, {
      points,
      type: pointsForm.type,
      reason: pointsForm.reason,
      operator: pointsForm.operator
    });
    message.success('积分调整成功');
    pointsModalVisible.value = false;
    pointsFormRef.value?.clearValidate();
    loadData();
  } catch (error) {
    console.error('积分调整失败:', error);
  } finally {
    pointsSubmitting.value = false;
  }
};

const openCouponModal = async (record) => {
  resetForm();
  currentMember.value = record;
  try {
    const result = await getCoupons({ page: 1, pageSize: 100, status: 1 });
    availableCoupons.value = result.list;
    couponModalVisible.value = true;
  } catch (error) {
    console.error('加载优惠券失败:', error);
  }
};

const handleCouponSubmit = async () => {
  if (!selectedCouponId.value) {
    message.warning('请选择优惠券');
    return;
  }
  try {
    await issueCoupon(selectedCouponId.value, {
      memberId: currentMember.value.id,
      operator: couponForm.operator
    });
    message.success('优惠券发放成功');
    couponModalVisible.value = false;
  } catch (error) {
    console.error('发放失败:', error);
  }
};

const viewDetail = async (record) => {
  currentMember.value = record;
  detailModalVisible.value = true;
  activeDetailTab.value = 'flows';
  flowPagination.page = 1;
  couponPagination.page = 1;

  const [detail, flows, coupons] = await Promise.all([
    getMember(record.id),
    getMemberPointFlows(record.id, { page: 1, pageSize: 10 }),
    getMemberCoupons(record.id, { page: 1, pageSize: 10 })
  ]);
  currentMember.value = detail;
  memberFlows.value = flows;
  memberCoupons.value = coupons;
};

const handleFlowPageChange = (page) => {
  flowPagination.page = page;
  loadMemberFlows();
};

const handleCouponPageChange = (page) => {
  couponPagination.page = page;
  loadMemberCoupons();
};

const loadMemberFlows = async () => {
  memberFlows.value = await getMemberPointFlows(currentMember.value.id, {
    page: flowPagination.page,
    pageSize: flowPagination.pageSize
  });
};

const loadMemberCoupons = async () => {
  memberCoupons.value = await getMemberCoupons(currentMember.value.id, {
    page: couponPagination.page,
    pageSize: couponPagination.pageSize
  });
};

const handleUseCoupon = async (record) => {
  try {
    await useCoupon(record.id, { memberId: currentMember.value.id });
    message.success('使用成功');
    loadMemberCoupons();
  } catch (error) {
    console.error('使用失败:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>
