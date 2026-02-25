<template>
  <el-card shadow="hover" class="timeline-card">
    <template #header>
      <span>🔍 运行步骤推演 (代入实值)</span>
      <el-tag type="success" style="float: right">{{ language }}</el-tag>
    </template>

    <el-timeline>
      <el-timeline-item
        v-for="step in steps"
        :key="step.step"
        :timestamp="`Step ${step.step}`"
        placement="top"
        type="primary"
      >
        <el-card shadow="never" class="step-card">
          <h4>{{ step.action }}</h4>
          <p class="description">{{ step.description }}</p>
          <div class="meta-info">
            <el-tag size="small" type="warning" effect="plain">
              📍 代码: {{ step.line_number }}
            </el-tag>
            <div class="variables">
              <code>{{ step.variables }}</code>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<script setup>
defineProps({
  steps: {
    type: Array,
    required: true,
    default: () => [],
  },
  language: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.timeline-card {
  margin-bottom: 16px;
}

.step-card {
  margin-bottom: 5px;
  transition: all 0.2s;
}

.step-card:hover {
  transform: translateX(5px);
}

.step-card h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
}

.description {
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.6;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.variables {
  background-color: #282c34;
  color: #98c379;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: Consolas, monospace;
  font-size: 14px;
  font-weight: bold;
  line-height: 1.5;
  overflow-x: auto;
  word-break: break-all;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .step-card h4 {
    font-size: 15px;
  }

  .description {
    font-size: 13px;
  }

  .variables {
    font-size: 12px;
    padding: 6px 10px;
  }

  :deep(.el-timeline-item__timestamp) {
    font-size: 12px;
  }

  :deep(.el-tag) {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .step-card h4 {
    font-size: 14px;
  }

  .description {
    font-size: 12px;
  }

  .variables {
    font-size: 11px;
  }
}
</style>
