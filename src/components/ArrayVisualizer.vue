<template>
  <el-card shadow="hover" class="visualizer-card">
    <template #header>
      <div class="visualizer-header">
        <span>🎬 算法执行动画</span>
        <el-tag :type="isPlaying ? 'success' : 'info'">
          {{ isPlaying ? "播放中" : "已暂停" }}
        </el-tag>
      </div>
    </template>

    <!-- 控制面板 -->
    <div class="controls">
      <el-button-group>
        <el-button
          type="primary"
          :icon="isPlaying ? VideoPause : VideoPlay"
          @click="togglePlay"
        >
          {{ isPlaying ? "暂停" : "播放" }}
        </el-button>
        <el-button :icon="RefreshLeft" @click="reset">重置</el-button>
        <el-button
          :icon="DArrowLeft"
          :disabled="currentStepIndex <= 0"
          @click="prevStep"
        >
          上一步
        </el-button>
        <el-button
          :icon="DArrowRight"
          :disabled="currentStepIndex >= steps.length - 1"
          @click="nextStep"
        >
          下一步
        </el-button>
      </el-button-group>

      <div class="speed-control">
        <span class="speed-label">速度:</span>
        <el-slider
          v-model="speed"
          :min="100"
          :max="2000"
          :step="100"
          :show-tooltip="false"
          style="width: 150px"
        />
        <span class="speed-value">{{ (2100 - speed) / 1000 }}x</span>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-info">
      <span>步骤: {{ currentStepIndex + 1 }} / {{ steps.length }}</span>
      <el-progress
        :percentage="progressPercentage"
        :stroke-width="6"
        :show-text="false"
      />
    </div>

    <!-- 可视化区域 -->
    <div class="visualization-area">
      <!-- 数组可视化 -->
      <div v-if="visualizationType === 'array'" class="array-container">
        <div
          v-for="(item, index) in currentState"
          :key="`item-${index}`"
          class="array-item"
          :class="{
            highlight: highlightedIndices.includes(index),
            comparing: comparingIndices.includes(index),
            swapping: swappingIndices.includes(index),
            sorted: sortedIndices.includes(index),
          }"
          :style="{ transitionDelay: index * 0.05 + 's' }"
        >
          <div class="bar" :style="{ height: getBarHeight(item.value) }">
            <span class="value">{{ item.value }}</span>
          </div>
          <span class="index">{{ index }}</span>
        </div>
      </div>

      <!-- 变量状态显示 -->
      <div
        v-if="currentStepData && currentStepData.variables"
        class="variables-display"
      >
        <el-tag type="info" effect="plain" class="variable-tag">
          {{ currentStepData.variables }}
        </el-tag>
      </div>

      <!-- 当前操作描述 -->
      <div v-if="currentStepData" class="action-description">
        <el-alert
          :title="currentStepData.action"
          type="success"
          :closable="false"
        >
          <p>{{ currentStepData.description }}</p>
        </el-alert>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import {
  VideoPlay,
  VideoPause,
  RefreshLeft,
  DArrowLeft,
  DArrowRight,
} from "@element-plus/icons-vue";

const props = defineProps({
  steps: {
    type: Array,
    required: true,
    default: () => [],
  },
  initialData: {
    type: Array,
    default: () => [],
  },
  visualizationType: {
    type: String,
    default: "array", // array, tree, graph
  },
});

// 状态管理
const currentStepIndex = ref(0);
const isPlaying = ref(false);
const speed = ref(1000); // 毫秒
const currentState = ref([]);
const highlightedIndices = ref([]);
const comparingIndices = ref([]);
const swappingIndices = ref([]);
const sortedIndices = ref([]);
let playTimer = null;

// 初始化状态
const initializeState = () => {
  if (props.initialData.length > 0) {
    currentState.value = props.initialData.map((val, idx) => ({
      value: val,
      id: idx,
    }));
  } else if (props.steps.length > 0 && props.steps[0].state) {
    currentState.value = props.steps[0].state.map((val, idx) => ({
      value: val,
      id: idx,
    }));
  }
};

// 当前步骤数据
const currentStepData = computed(() => {
  if (
    currentStepIndex.value >= 0 &&
    currentStepIndex.value < props.steps.length
  ) {
    return props.steps[currentStepIndex.value];
  }
  return null;
});

// 进度百分比
const progressPercentage = computed(() => {
  if (props.steps.length === 0) return 0;
  return Math.round(((currentStepIndex.value + 1) / props.steps.length) * 100);
});

// 计算柱状图高度
const getBarHeight = (value) => {
  const maxValue = Math.max(...currentState.value.map((item) => item.value));
  const minHeight = 30;
  const maxHeight = 200;
  return `${minHeight + (value / maxValue) * (maxHeight - minHeight)}px`;
};

// 解析步骤数据并更新可视化状态
const applyStep = (stepData) => {
  if (!stepData) return;

  // 更新数组状态
  if (stepData.state) {
    currentState.value = stepData.state.map((val, idx) => ({
      value: val,
      id: idx,
    }));
  }

  // 重置所有高亮状态
  highlightedIndices.value = [];
  comparingIndices.value = [];
  swappingIndices.value = [];

  // 根据操作类型设置高亮
  const action = stepData.action?.toLowerCase() || "";

  if (action.includes("比较") || action.includes("compare")) {
    comparingIndices.value = stepData.elements || [];
  } else if (action.includes("交换") || action.includes("swap")) {
    swappingIndices.value = stepData.elements || [];
  } else if (action.includes("已排序") || action.includes("sorted")) {
    sortedIndices.value = stepData.elements || [];
  } else {
    highlightedIndices.value = stepData.elements || [];
  }
};

// 播放/暂停
const togglePlay = () => {
  if (isPlaying.value) {
    pause();
  } else {
    play();
  }
};

// 播放
const play = () => {
  if (currentStepIndex.value >= props.steps.length - 1) {
    currentStepIndex.value = 0;
  }
  isPlaying.value = true;
  autoPlay();
};

// 自动播放
const autoPlay = () => {
  if (!isPlaying.value) return;

  playTimer = setTimeout(() => {
    if (currentStepIndex.value < props.steps.length - 1) {
      nextStep();
      autoPlay();
    } else {
      isPlaying.value = false;
    }
  }, speed.value);
};

// 暂停
const pause = () => {
  isPlaying.value = false;
  if (playTimer) {
    clearTimeout(playTimer);
    playTimer = null;
  }
};

// 重置
const reset = () => {
  pause();
  currentStepIndex.value = 0;
  initializeState();
  applyStep(props.steps[0]);
};

// 下一步
const nextStep = () => {
  if (currentStepIndex.value < props.steps.length - 1) {
    currentStepIndex.value++;
    applyStep(props.steps[currentStepIndex.value]);
  }
};

// 上一步
const prevStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
    applyStep(props.steps[currentStepIndex.value]);
  }
};

// 监听步骤变化
watch(
  () => props.steps,
  () => {
    reset();
  },
  { immediate: true },
);

// 监听速度变化
watch(speed, () => {
  if (isPlaying.value) {
    pause();
    play();
  }
});

// 组件卸载时清理定时器
onUnmounted(() => {
  pause();
});
</script>

<style scoped>
.visualizer-card {
  margin-bottom: 20px;
}

.visualizer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.speed-label {
  font-size: 14px;
  color: #606266;
}

.speed-value {
  min-width: 40px;
  font-weight: bold;
  color: #409eff;
}

.progress-info {
  margin-bottom: 20px;
}

.progress-info > span {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.visualization-area {
  min-height: 300px;
}

.array-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 8px;
  padding: 20px;
  min-height: 250px;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 8px;
  overflow-x: auto;
}

.array-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.bar {
  width: 45px;
  background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.value {
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.index {
  font-size: 12px;
  color: #909399;
  font-weight: bold;
}

/* 高亮状态 */
.highlight .bar {
  background: linear-gradient(180deg, #ffc107 0%, #ffb300 100%);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.5);
  transform: scale(1.1);
}

/* 比较状态 */
.comparing .bar {
  background: linear-gradient(180deg, #e6a23c 0%, #f5ba62 100%);
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.5);
  animation: pulse 0.6s ease-in-out infinite;
}

/* 交换状态 */
.swapping .bar {
  background: linear-gradient(180deg, #f56c6c 0%, #ff8585 100%);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.5);
  transform: translateY(-15px) scale(1.15);
}

/* 已排序状态 */
.sorted .bar {
  background: linear-gradient(180deg, #67c23a 0%, #85ce61 100%);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.5);
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

.variables-display {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.variable-tag {
  font-family: "Consolas", monospace;
  font-size: 13px;
}

.action-description {
  margin-top: 20px;
}

.action-description p {
  margin: 5px 0 0 0;
  font-size: 14px;
  line-height: 1.6;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .speed-control {
    justify-content: space-between;
  }

  .array-container {
    gap: 4px;
    padding: 10px;
  }

  .bar {
    width: 35px;
  }

  .value {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .bar {
    width: 28px;
  }

  :deep(.el-button-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  :deep(.el-button) {
    flex: 1;
    min-width: 45%;
  }
}
</style>
