<template>
  <el-dialog
    v-model="visible"
    title="关于 AI 算法解析引擎"
    width="90%"
    :style="{ maxWidth: '600px' }"
    center
  >
    <div class="about-content">
      <!-- Logo 和标题 -->
      <div class="about-header">
        <div class="about-logo">🚀</div>
        <h2>AI 算法解析引擎</h2>
        <el-tag type="success" effect="plain">v{{ version }}</el-tag>
      </div>

      <!-- 项目简介 -->
      <div class="about-section">
        <h3>📝 项目简介</h3>
        <p>
          一个基于 AI
          的算法代码智能分析工具，能够自动识别算法类型、精确计算复杂度、可视化展示执行步骤，并提供专业的性能优化建议。
        </p>
      </div>

      <!-- 核心功能 -->
      <div class="about-section">
        <h3>✨ 核心功能</h3>
        <ul>
          <li>🔍 智能代码解析 - 自动识别算法类型</li>
          <li>⚡ 复杂度分析 - 时间和空间复杂度计算</li>
          <li>📊 步骤推演 - 可视化代码执行过程</li>
          <li>💡 优化建议 - AI 驱动的性能优化方案</li>
          <li>🌈 多语言支持 - 8 种编程语言</li>
          <li>📚 示例代码库 - 经典算法模板</li>
          <li>💾 历史记录 - 本地保存分析结果</li>
        </ul>
      </div>

      <!-- 技术栈 -->
      <div class="about-section">
        <h3>🛠️ 技术栈</h3>
        <div class="tech-stack">
          <el-tag v-for="tech in techStack" :key="tech.name" class="tech-tag">
            {{ tech.icon }} {{ tech.name }}
          </el-tag>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="about-section">
        <h3>📈 统计信息</h3>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-statistic title="支持语言" :value="8" suffix="种" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="示例代码" :value="8" suffix="个" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="历史记录" :value="historyCount" suffix="条" />
          </el-col>
        </el-row>
      </div>

      <!-- 开源信息 -->
      <div class="about-section">
        <h3>🤝 开源协议</h3>
        <p>本项目采用 MIT 开源协议，欢迎参与贡献！</p>
        <div class="about-links">
          <el-button type="primary" link @click="openLink(githubUrl)">
            <el-icon><Link /></el-icon>
            GitHub 仓库
          </el-button>
          <el-button type="success" link @click="openLink(docUrl)">
            <el-icon><Document /></el-icon>
            使用文档
          </el-button>
          <el-button type="warning" link @click="openLink(issueUrl)">
            <el-icon><ChatDotRound /></el-icon>
            反馈问题
          </el-button>
        </div>
      </div>

      <!-- 致谢 -->
      <div class="about-section">
        <h3>🙏 致谢</h3>
        <p class="thanks-text">
          感谢 Vue.js、Element Plus、Monaco Editor、Cloudflare Workers
          等开源项目，以及所有为本项目做出贡献的开发者。
        </p>
      </div>

      <!-- 版权信息 -->
      <div class="about-footer">
        <p>© 2026 AI 算法解析引擎</p>
        <p class="footer-sub">基于 AI 技术，专注算法学习与优化</p>
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { Link, Document, ChatDotRound } from "@element-plus/icons-vue";
import { HistoryManager } from "../utils/historyManager.js";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 版本信息
const version = "1.0.0";

// 技术栈
const techStack = [
  { name: "Vue 3", icon: "💚" },
  { name: "Vite", icon: "⚡" },
  { name: "Element Plus", icon: "🎨" },
  { name: "Monaco Editor", icon: "📝" },
  { name: "Cloudflare Workers", icon: "☁️" },
  { name: "AI API", icon: "🤖" },
];

// 链接（请替换为实际链接）
const githubUrl = "https://github.com/GCHkongcheng/kc-analyzer";
const docUrl = "https://github.com/GCHkongcheng/kc-analyzer#readme";
const issueUrl = "https://github.com/GCHkongcheng/kc-analyzer/issues";

// 历史记录数量
const historyCount = computed(() => {
  return HistoryManager.getAll().length;
});

// 打开链接
const openLink = (url) => {
  window.open(url, "_blank");
};
</script>

<style scoped>
.about-content {
  padding: 10px;
}

.about-header {
  text-align: center;
  padding: 20px 0;
  border-bottom: 2px solid var(--el-border-color-light);
  margin-bottom: 20px;
}

.about-logo {
  font-size: 64px;
  margin-bottom: 10px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.about-header h2 {
  margin: 10px 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.about-section {
  margin-bottom: 24px;
}

.about-section h3 {
  font-size: 16px;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  font-weight: 600;
}

.about-section p {
  color: var(--el-text-color-regular);
  line-height: 1.8;
  margin: 0;
}

.about-section ul {
  margin: 0;
  padding-left: 20px;
  color: var(--el-text-color-regular);
  line-height: 2;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  font-size: 13px;
}

.about-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.thanks-text {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.about-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-light);
  margin-top: 20px;
}

.about-footer p {
  margin: 5px 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.footer-sub {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .about-header h2 {
    font-size: 20px;
  }

  .about-logo {
    font-size: 48px;
  }

  .about-section h3 {
    font-size: 15px;
  }

  .about-section p,
  .about-section ul {
    font-size: 14px;
  }

  .about-links {
    flex-direction: column;
  }

  .about-links .el-button {
    width: 100%;
  }
}
</style>
