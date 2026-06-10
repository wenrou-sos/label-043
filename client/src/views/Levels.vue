<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">等级配置</h2>
      <a-button type="primary" @click="openAddModal">
        <template #icon><PlusOutlined /></template>
        新增等级
      </a-button>
    </div>

    <a-card>
      <a-alert
        message="等级说明"
        description="会员积分达到对应等级的最低积分后，系统将自动升级会员等级。最高等级不设上限。"
        type="info"
        show-icon
        style="margin-bottom: 16px;"
      />

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'level'">
            <span :class="['level-badge', `level-${index + 1}`]">
              {{ record.name }}
            </span>
          </template>
          <template v-else-if="column.key === 'range'">
            {{ record.min_points }} - {{ record.max_points || '不限' }}
          </template>
          <template v-else-if="column.key === 'discount'">
            {{ record.discount }}折
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openEditModal(record)">编辑</a-button>
              <a-popconfirm title="确定删除该等级吗？" @confirm="handleDelete(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑等级' : '新增等级'"
      width="500px"
      @ok="handleSubmit"
      @cancel="modalVisible = false"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="等级名称" required>
          <a-input v-model:value="formData.name" placeholder="请输入等级名称" />
        </a-form-item>
        <a-form-item label="最低积分" required>
          <a-input-number
            v-model:value="formData.min_points"
            :min="0"
            style="width: 100%;"
            placeholder="请输入最低积分"
          />
        </a-form-item>
        <a-form-item label="最高积分">
          <a-input-number
            v-model:value="formData.max_points"
            :min="0"
            :placeholder="'不设上限请留空'"
            style="width: 100%;"
          />
        </a-form-item>
        <a-form-item label="折扣(%)" required>
          <a-input-number
            v-model:value="formData.discount"
            :min="1"
            :max="100"
            :step="1"
            style="width: 100%;"
            placeholder="请输入折扣(1-100)"
          />
        </a-form-item>
        <a-form-item label="等级描述">
          <a-textarea v-model:value="formData.description" placeholder="请输入等级描述" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { getLevels, createLevel, updateLevel, deleteLevel } from '@/api';

const loading = ref(false);
const dataSource = ref([]);

const modalVisible = ref(false);
const isEdit = ref(false);
const editingId = ref(null);
const formData = reactive({
  name: '', min_points: 0, max_points: null, discount: 100, description: ''
});

const columns = [
  { title: '等级', key: 'level', width: 120 },
  { title: '等级名称', dataIndex: 'name', key: 'name', width: 120 },
  { title: '积分范围', key: 'range', width: 150 },
  { title: '折扣', key: 'discount', width: 100 },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 170 },
  { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at', width: 170 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
];

const loadData = async () => {
  loading.value = true;
  try {
    dataSource.value = await getLevels();
  } catch (error) {
    console.error('加载失败:', error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.assign(formData, {
    name: '', min_points: 0, max_points: null, discount: 100, description: ''
  });
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
    min_points: record.min_points,
    max_points: record.max_points,
    discount: record.discount,
    description: record.description
  });
  modalVisible.value = true;
};

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await updateLevel(editingId.value, formData);
      message.success('更新成功');
    } else {
      await createLevel(formData);
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
    await deleteLevel(id);
    message.success('删除成功');
    loadData();
  } catch (error) {
    console.error('删除失败:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>
