<template>
  <div class="result-panel">
    <!-- 空状态 -->
    <el-empty
      v-if="!resultData && !loading"
      description="等待输入代码进行解析..."
      :image-size="120"
    >
      <template #image>
        <div class="empty-icon">🤖</div>
      </template>
      <template #description>
        <p class="empty-desc">选择示例代码或输入您的算法代码</p>
        <p class="empty-hint">AI 将为您分析复杂度和执行步骤</p>
      </template>
    </el-empty>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <div class="loading-spinner">
          <el-icon class="is-loading" :size="50">
            <Loading />
          </el-icon>
        </div>
        <div class="loading-text">
          <h3>{{ loadingSteps[currentStep].title }}</h3>
          <p>{{ loadingSteps[currentStep].desc }}</p>
        </div>
        <el-progress
          :percentage="loadingProgress"
          :stroke-width="8"
          :show-text="false"
          status="success"
          striped
          striped-flow
        />
      </div>
    </div>

    <!-- 结果展示 -->
    <div v-if="resultData && !loading" class="result-area">
      <div class="result-sticky-summary">
        <!-- 操作按钮栏 -->
        <div class="action-bar">
          <el-button-group>
            <el-button type="primary" plain @click="copyAsMarkdown">
              <el-icon><DocumentCopy /></el-icon>
              复制 Markdown
            </el-button>
            <el-button type="success" plain @click="copyAsText">
              <el-icon><CopyDocument /></el-icon>
              复制纯文本
            </el-button>
          </el-button-group>
        </div>

        <ComplexityMetric :complexity="resultData.complexity" />

        <!-- 视图切换按钮（仅多视图时展示） -->
        <div v-if="showVisualizerTab" class="view-switcher">
          <el-radio-group v-model="currentView" size="default">
            <el-radio-button label="timeline">
              <el-icon><List /></el-icon>
              {{ isCallStackType ? "调用栈" : "执行步骤" }}
            </el-radio-button>
            <el-radio-button v-if="showVisualizerTab" label="visualizer">
              <el-icon><VideoPlay /></el-icon>
              {{ visualizerTabLabel }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <div v-else class="single-view-indicator">
          <el-tag size="small" type="success" effect="light">
            当前视图: {{ isCallStackType ? "调用栈" : "执行步骤" }}
          </el-tag>
        </div>

        <div class="render-type-hint">
          <el-tag size="small" effect="plain" type="info">
            渲染类型: {{ resolvedRenderType }}
          </el-tag>
        </div>
      </div>

      <!-- 数组可视化 -->
      <ArrayVisualizer
        v-if="currentView === 'visualizer' && resolvedRenderType === 'array'"
        :steps="resultData.step_by_step"
        :initial-data="extractInitialData()"
        visualization-type="array"
      />

      <GraphTreeRenderer
        v-if="
          currentView === 'visualizer' &&
          (resolvedRenderType === 'tree' || resolvedRenderType === 'graph')
        "
        :render-type="resolvedRenderType"
        :steps="resultData.step_by_step"
        :visualization-data="resultData.visualization || null"
      />

      <el-alert
        v-if="
          currentView === 'visualizer' &&
          !['array', 'tree', 'graph'].includes(resolvedRenderType)
        "
        type="info"
        show-icon
        :closable="false"
        class="visualizer-notice"
        title="该算法当前使用时间轴/调用栈可视化"
      >
        <template #default>
          render_type 为 {{ resolvedRenderType }}，建议查看“{{
            isCallStackType ? "调用栈" : "执行步骤"
          }}”视图。
        </template>
      </el-alert>

      <!-- 执行步骤时间轴 -->
      <StepTimeline
        v-if="currentView === 'timeline'"
        :steps="resultData.step_by_step"
        :language="resultData.language"
        :render-type="resolvedRenderType"
        :title="
          isCallStackType ? '调用栈推演 (代入实值)' : '运行步骤推演 (代入实值)'
        "
      />

      <el-card shadow="hover" class="optimization-card">
        <template #header>
          <div class="optimization-header">
            <span>💡 优化建议</span>
            <el-tag :type="getRatingType(resultData.rating)" effect="dark">
              {{ resultData.rating }}
            </el-tag>
          </div>
        </template>
        <p class="optimization-content">
          {{ resultData.optimization }}
        </p>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import {
  Loading,
  DocumentCopy,
  CopyDocument,
  List,
  VideoPlay,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import ComplexityMetric from "./ComplexityMetric.vue";
import StepTimeline from "./StepTimeline.vue";
import ArrayVisualizer from "./ArrayVisualizer.vue";
import GraphTreeRenderer from "./GraphTreeRenderer.vue";

const props = defineProps({
  resultData: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

// 加载步骤
const loadingSteps = [
  { title: "🔍 正在解析代码结构", desc: "识别算法类型和关键逻辑..." },
  { title: "⚡ 正在计算复杂度", desc: "分析时间和空间消耗..." },
  { title: "🎯 正在推演执行步骤", desc: "模拟代码运行过程..." },
  { title: "💡 正在生成优化建议", desc: "评估算法性能和改进方案..." },
];

const currentStep = ref(0);
const loadingProgress = ref(0);
const currentView = ref("timeline"); // timeline 或 visualizer

const resolvedRenderType = computed(() => {
  if (!props.resultData) return "timeline";
  const type = props.resultData.render_type;
  const allowed = ["array", "tree", "graph", "call_stack", "timeline"];
  if (allowed.includes(type)) return type;

  const steps = props.resultData.step_by_step || [];
  const hasDepth = steps.some((step) => {
    if (typeof step?.depth === "number") return true;
    return /depth\s*[:=]\s*\d+/i.test(String(step?.variables || ""));
  });
  const hasArraySignals = steps.some((step) => {
    return (
      Array.isArray(step?.state) ||
      Array.isArray(step?.elements) ||
      /compare|swap|sort|排序|交换|比较/i.test(
        `${step?.action || ""} ${step?.description || ""}`,
      )
    );
  });

  if (hasArraySignals) return "array";
  if (hasDepth) return "call_stack";
  return "timeline";
});

const showVisualizerTab = computed(() => {
  return ["array", "tree", "graph"].includes(resolvedRenderType.value);
});

const visualizerTabLabel = computed(() => {
  if (resolvedRenderType.value === "tree") return "树可视化";
  if (resolvedRenderType.value === "graph") return "图可视化";
  return "动画演示";
});
const isCallStackType = computed(
  () => resolvedRenderType.value === "call_stack",
);

// 加载动画循环
let stepInterval = null;
let progressInterval = null;

const startLoadingAnimation = () => {
  currentStep.value = 0;
  loadingProgress.value = 0;

  // 步骤切换
  stepInterval = setInterval(() => {
    currentStep.value = (currentStep.value + 1) % loadingSteps.length;
  }, 2000);

  // 进度条增长
  progressInterval = setInterval(() => {
    if (loadingProgress.value < 90) {
      loadingProgress.value += Math.random() * 15;
    }
  }, 300);
};

const stopLoadingAnimation = () => {
  if (stepInterval) {
    clearInterval(stepInterval);
    stepInterval = null;
  }
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  // 完成时进度达到 100%
  if (!props.loading && props.resultData) {
    loadingProgress.value = 100;
  }
};

// 监听加载状态
watch(
  () => props.loading,
  (newVal) => {
    if (newVal) {
      startLoadingAnimation();
    } else {
      stopLoadingAnimation();
    }
  },
  { immediate: true },
);

// 根据评级返回标签类型
const getRatingType = (rating) => {
  if (rating?.includes("优秀")) return "success";
  if (rating?.includes("合格")) return "primary";
  if (rating?.includes("需优化")) return "warning";
  return "info";
};

watch(showVisualizerTab, (enabled) => {
  if (!enabled && currentView.value === "visualizer") {
    currentView.value = "timeline";
  }
});

// 提取初始数据
const extractInitialData = () => {
  // 尝试从第一个步骤的 variables 中提取数组
  if (props.resultData?.step_by_step?.[0]?.variables) {
    const vars = props.resultData.step_by_step[0].variables;
    // 尝试匹配常见的数组变量名
    const arrayMatch = String(vars).match(/\[([\d,\s]+)\]/);
    if (arrayMatch) {
      return arrayMatch[1].split(",").map((n) => parseInt(n.trim()));
    }
  }

  // 默认样例数据
  return [5, 2, 8, 1, 9, 3, 7, 4, 6];
};

// 生成 Markdown 格式内容
const generateMarkdown = () => {
  if (!props.resultData) return "";

  const { complexity, step_by_step, rating, optimization, language } =
    props.resultData;

  let markdown = `# 算法分析结果\n\n`;
  markdown += `**语言**: ${language}\n\n`;
  markdown += `## 复杂度分析\n\n`;
  markdown += `- **时间复杂度**: ${complexity.time}\n`;
  markdown += `- **空间复杂度**: ${complexity.space}\n`;
  markdown += `- **说明**: ${complexity.explanation}\n\n`;
  markdown += `## 执行步骤\n\n`;

  step_by_step.forEach((step) => {
    markdown += `### Step ${step.step}: ${step.action}\n\n`;
    markdown += `${step.description}\n\n`;
    markdown += `- **代码位置**: ${step.line_number}\n`;
    markdown += `- **变量状态**: \`${step.variables}\`\n\n`;
  });

  markdown += `## 优化建议\n\n`;
  markdown += `**评级**: ${rating}\n\n`;
  markdown += `${optimization}\n\n`;
  markdown += `---\n`;
  markdown += `*生成时间: ${new Date().toLocaleString("zh-CN")}*\n`;

  return markdown;
};

// 生成纯文本内容
const generatePlainText = () => {
  if (!props.resultData) return "";

  const { complexity, step_by_step, rating, optimization, language } =
    props.resultData;

  let text = `算法分析结果\n\n`;
  text += `语言: ${language}\n\n`;
  text += `复杂度分析\n`;
  text += `时间复杂度: ${complexity.time}\n`;
  text += `空间复杂度: ${complexity.space}\n`;
  text += `说明: ${complexity.explanation}\n\n`;
  text += `执行步骤\n\n`;

  step_by_step.forEach((step) => {
    text += `Step ${step.step}: ${step.action}\n`;
    text += `${step.description}\n`;
    text += `代码位置: ${step.line_number}\n`;
    text += `变量状态: ${step.variables}\n\n`;
  });

  text += `优化建议\n`;
  text += `评级: ${rating}\n`;
  text += `${optimization}\n\n`;
  text += `生成时间: ${new Date().toLocaleString("zh-CN")}\n`;

  return text;
};

// 复制到剪贴板
const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error("复制失败:", err);
    return false;
  }
};

// 复制为 Markdown
const copyAsMarkdown = async () => {
  const markdown = generateMarkdown();
  const success = await copyToClipboard(markdown);
  if (success) {
    ElMessage.success("已复制为 Markdown 格式");
  } else {
    ElMessage.error("复制失败，请重试");
  }
};

// 复制为纯文本
const copyAsText = async () => {
  const text = generatePlainText();
  const success = await copyToClipboard(text);
  if (success) {
    ElMessage.success("已复制为纯文本格式");
  } else {
    ElMessage.error("复制失败，请重试");
  }
};
</script>

<style scoped>
.result-panel {
  min-height: 400px;
}

/* 操作按钮栏 */
.action-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 空状态样式 */
.empty-icon {
  font-size: 80px;
  line-height: 1;
  animation: float 3s ease-in-out infinite;
}

.empty-desc {
  font-size: 16px;
  color: #606266;
  margin: 10px 0 5px 0;
}

.empty-hint {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px 20px;
}

.loading-content {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.loading-spinner {
  margin-bottom: 20px;
  color: #409eff;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.loading-text {
  margin-bottom: 20px;
}

.loading-text h3 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.loading-text p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 结果展示样式 */
.result-area {
  animation: fadeIn 0.4s ease-in;
}

.result-sticky-summary {
  position: sticky;
  top: 8px;
  z-index: 10;
  background-color: var(--card-bg, #ffffff);
  padding-top: 2px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.optimization-card {
  margin-top: 16px;
}

.view-switcher {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.single-view-indicator {
  margin: 12px 0 8px;
  display: flex;
  justify-content: center;
}

.render-type-hint {
  margin: 8px 0 2px;
  display: flex;
  justify-content: center;
}

.visualizer-notice {
  margin: 8px 0 16px;
}

.view-switcher :deep(.el-radio-button) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.view-switcher :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
}

.optimization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.optimization-content {
  line-height: 1.8;
  color: #606266;
  margin: 0;
  font-size: 14px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .result-panel {
    min-height: 300px;
  }

  .result-sticky-summary {
    position: static;
    top: auto;
  }

  .action-bar {
    justify-content: center;
  }

  .action-bar :deep(.el-button) {
    font-size: 13px;
    padding: 8px 12px;
  }

  .loading-container {
    min-height: 300px;
    padding: 30px 15px;
  }

  .loading-spinner :deep(.el-icon) {
    font-size: 40px !important;
  }

  .loading-text h3 {
    font-size: 16px;
  }

  .loading-text p {
    font-size: 13px;
  }

  .empty-icon {
    font-size: 60px;
  }

  .empty-desc {
    font-size: 14px;
  }

  .optimization-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .action-bar :deep(.el-button-group) {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .action-bar :deep(.el-button) {
    width: 100%;
    margin: 0 0 8px 0 !important;
    border-radius: 4px !important;
  }
}
</style>
