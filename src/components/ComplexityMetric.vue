<template>
  <div>
    <el-row :gutter="15" class="mb-4">
      <el-col :span="12">
        <el-card shadow="never" class="metric-card">
          <div class="metric-title">⏱️ 时间复杂度</div>
          <div class="metric-value">{{ complexity.time }}</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="metric-card">
          <div class="metric-title">💾 空间复杂度</div>
          <div class="metric-value">{{ complexity.space }}</div>
        </el-card>
      </el-col>
      <el-col :span="24" class="mt-2">
        <el-alert
          :title="complexity.explanation"
          type="info"
          :closable="false"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
defineProps({
  complexity: {
    type: Object,
    required: true,
    default: () => ({
      time: "",
      space: "",
      explanation: "",
    }),
  },
});
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}

.mt-2 {
  margin-top: 8px;
}

.metric-card {
  text-align: center;
  background-color: #f8f9fa;
  transition: all 0.3s;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  word-break: break-word;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .metric-title {
    font-size: 13px;
  }

  .metric-value {
    font-size: 18px;
  }

  :deep(.el-alert__title) {
    font-size: 13px;
    line-height: 1.5;
  }
}

@media (max-width: 480px) {
  .metric-title {
    font-size: 12px;
  }

  .metric-value {
    font-size: 16px;
  }
}
</style>
