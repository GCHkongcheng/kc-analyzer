<template>
  <el-drawer
    v-model="visible"
    title="📜 历史记录"
    :size="drawerSize"
    direction="rtl"
  >
    <div class="history-drawer">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-text type="info" size="small">
          共 {{ historyList.length }} 条记录
        </el-text>
        <el-button
          type="danger"
          size="small"
          plain
          :disabled="historyList.length === 0"
          @click="handleClearAll"
        >
          清空全部
        </el-button>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="historyList.length === 0"
        description="暂无历史记录"
        :image-size="100"
      >
        <template #image>
          <div class="empty-icon">📝</div>
        </template>
      </el-empty>

      <!-- 历史记录列表 -->
      <div v-else class="history-list">
        <el-card
          v-for="record in historyList"
          :key="record.id"
          shadow="hover"
          class="history-item"
        >
          <div class="record-header">
            <div class="record-info">
              <el-tag size="small" type="success">
                {{ getLanguageName(record.language) }}
              </el-tag>
              <el-text size="small" type="info" class="record-time">
                {{ formatTime(record.timestamp) }}
              </el-text>
            </div>
            <el-button-group size="small">
              <el-button type="primary" plain @click="handleLoad(record)">
                加载
              </el-button>
              <el-button type="danger" plain @click="handleDelete(record.id)">
                删除
              </el-button>
            </el-button-group>
          </div>

          <div class="record-preview">
            <code>{{ record.preview }}</code>
          </div>

          <div class="record-meta">
            <el-tag size="small" effect="plain">
              {{ record.result.complexity?.time || "N/A" }}
            </el-tag>
            <el-tag size="small" effect="plain" type="warning">
              {{ record.result.rating || "N/A" }}
            </el-tag>
          </div>
        </el-card>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { HistoryManager } from "../utils/historyManager.js";
import { ElMessageBox, ElMessage } from "element-plus";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "load"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const historyList = ref([]);

// 响应式抽屉大小
const drawerSize = computed(() => {
  if (window.innerWidth < 768) return "90%";
  if (window.innerWidth < 992) return "60%";
  return "40%";
});

// 加载历史记录
const loadHistory = () => {
  historyList.value = HistoryManager.getAll();
};

// 监听抽屉打开，刷新历史记录
watch(visible, (newVal) => {
  if (newVal) {
    loadHistory();
  }
});

// 语言名称映射
const languageMap = {
  cpp: "C++",
  python: "Python",
  javascript: "JavaScript",
  java: "Java",
  go: "Go",
  rust: "Rust",
  typescript: "TypeScript",
  c: "C",
};

const getLanguageName = (lang) => {
  return languageMap[lang] || lang;
};

const formatTime = (timestamp) => {
  return HistoryManager.formatTime(timestamp);
};

// 加载历史记录
const handleLoad = (record) => {
  emit("load", record);
  visible.value = false;
  ElMessage.success("已加载历史记录");
};

// 删除单条记录
const handleDelete = (id) => {
  ElMessageBox.confirm("确定要删除这条记录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      if (HistoryManager.delete(id)) {
        loadHistory();
        ElMessage.success("删除成功");
      } else {
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {});
};

// 清空所有记录
const handleClearAll = () => {
  ElMessageBox.confirm(
    `确定要清空所有 ${historyList.value.length} 条历史记录吗？此操作不可恢复！`,
    "警告",
    {
      confirmButtonText: "确定清空",
      cancelButtonText: "取消",
      type: "warning",
      confirmButtonClass: "el-button--danger",
    },
  )
    .then(() => {
      if (HistoryManager.clear()) {
        loadHistory();
        ElMessage.success("已清空所有历史记录");
      } else {
        ElMessage.error("清空失败");
      }
    })
    .catch(() => {});
};

// 初始加载
loadHistory();
</script>

<style scoped>
.history-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 16px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

.empty-icon {
  font-size: 60px;
}

.history-list {
  flex: 1;
  overflow-y: auto;
}

.history-item {
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  transform: translateX(-4px);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.record-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.record-time {
  font-size: 12px;
}

.record-preview {
  background-color: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-preview code {
  font-family: Consolas, monospace;
}

.record-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .record-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .record-info {
    width: 100%;
  }

  :deep(.el-button-group) {
    width: 100%;
  }

  :deep(.el-button-group .el-button) {
    flex: 1;
  }
}
</style>
