<template>
  <div class="analyzer-container">
    <div class="header-section">
      <h2 class="page-title">🚀 空城 算法解析引擎</h2>
      <div class="header-actions">
        <el-button
          type="primary"
          plain
          class="action-btn desktop-action"
          @click="showHistory = true"
        >
          <el-icon><Clock /></el-icon>
          <span class="btn-text">历史记录</span>
        </el-button>
        <el-button
          :type="isDark ? 'warning' : 'info'"
          plain
          class="action-btn desktop-action"
          @click="toggleTheme"
        >
          <el-icon>
            <component :is="isDark ? Sunny : Moon" />
          </el-icon>
          <span class="btn-text">{{ isDark ? "浅色" : "深色" }}</span>
        </el-button>
        <el-button
          type="warning"
          plain
          class="action-btn desktop-action"
          @click="activeModule = 'settings'"
        >
          <el-icon><Setting /></el-icon>
          <span class="btn-text">设置</span>
        </el-button>
        <el-button
          type="success"
          plain
          class="action-btn desktop-action"
          @click="showAbout = true"
        >
          <el-icon><InfoFilled /></el-icon>
          <span class="btn-text">关于</span>
        </el-button>

        <el-dropdown class="mobile-actions" @command="handleMobileAction">
          <el-button type="primary" plain class="action-btn">
            <el-icon><MoreFilled /></el-icon>
            <span class="btn-text">更多</span>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="history">历史记录</el-dropdown-item>
              <el-dropdown-item command="theme">
                {{ isDark ? "切换浅色" : "切换深色" }}
              </el-dropdown-item>
              <el-dropdown-item command="settings">系统设置</el-dropdown-item>
              <el-dropdown-item command="about">关于</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <el-menu
      mode="horizontal"
      :default-active="activeModule"
      class="module-menu"
      @select="handleModuleSelect"
    >
      <el-menu-item index="workspace">
        <el-icon><House /></el-icon>
        分析工作台
      </el-menu-item>
      <el-menu-item index="library">
        <el-icon><Collection /></el-icon>
        算法库
      </el-menu-item>
    </el-menu>

    <section v-if="activeModule === 'workspace'">
      <el-row :gutter="20" class="workspace-layout">
        <el-col :xs="24" :md="10" class="workspace-col code-col">
          <CodeEditor
            v-model:code="codeContent"
            :loading="isLoading"
            :theme="isDark ? 'dark' : 'light'"
            @analyze="handleAnalyze"
          />

          <el-alert
            v-if="errorMessage"
            :title="errorMessage"
            type="error"
            show-icon
            class="mt-4"
            :closable="true"
            @close="
              errorMessage = '';
              errorDetails = null;
            "
          >
            <template v-if="errorDetails" #default>
              <el-collapse accordion style="margin-top: 10px">
                <el-collapse-item title="查看详细错误信息" name="1">
                  <pre class="error-details">{{
                    JSON.stringify(errorDetails, null, 2)
                  }}</pre>
                </el-collapse-item>
              </el-collapse>
            </template>
          </el-alert>
        </el-col>

        <el-col :xs="24" :md="14" class="workspace-col result-col">
          <ResultPanel :resultData="resultData" :loading="isLoading" />
        </el-col>
      </el-row>
    </section>

    <section v-else-if="activeModule === 'library'">
      <AlgorithmLibrary @load-example="handleLoadExampleFromLibrary" />
    </section>

    <section v-else-if="activeModule === 'settings'">
      <SystemSettings
        :theme="isDark ? 'dark' : 'light'"
        :api-url-override="apiUrlOverride"
        :runtime-config="runtimeConfig"
        @update-theme="handleThemeFromSettings"
        @update-api-url="handleApiUrlUpdate"
        @update-runtime-config="handleRuntimeConfigUpdate"
      />
    </section>

    <!-- 历史记录抽屉 -->
    <HistoryDrawer v-model="showHistory" @load="handleLoadHistory" />

    <!-- 关于对话框 -->
    <AboutDialog v-model="showAbout" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import {
  Clock,
  Sunny,
  Moon,
  InfoFilled,
  House,
  Collection,
  Setting,
  MoreFilled,
} from "@element-plus/icons-vue";
import CodeEditor from "./components/CodeEditor.vue";
import ResultPanel from "./components/ResultPanel.vue";
import HistoryDrawer from "./components/HistoryDrawer.vue";
import AboutDialog from "./components/AboutDialog.vue";
import AlgorithmLibrary from "./components/AlgorithmLibrary.vue";
import SystemSettings from "./components/SystemSettings.vue";
import { HistoryManager } from "./utils/historyManager.js";
import { ThemeManager } from "./utils/themeManager.js";

// 从环境变量读取 API URL
const ENV_API_URL =
  import.meta.env.VITE_API_URL ||
  "https://api2.283947.xyz";

const codeContent = ref(`class Solution {
public:
    void backtrack(vector<vector<int>>& res, vector<int>& output, int first, int len){
        // 所有数都填完了
        if (first == len) {
            res.emplace_back(output);
            return;
        }
        for (int i = first; i < len; ++i) {
            // 动态维护数组
            swap(output[i], output[first]);
            // 继续递归填下一个数
            backtrack(res, output, first + 1, len);
            // 撤销操作
            swap(output[i], output[first]);
        }
    }
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int> > res;
        backtrack(res, nums, 0, (int)nums.size());
        return res;
    }
};`);

const isLoading = ref(false);
const resultData = ref(null);
const errorMessage = ref("");
const errorDetails = ref(null);
const showHistory = ref(false);
const showAbout = ref(false);
const isDark = ref(false);
const currentLanguage = ref("cpp"); // 追踪当前语言
const activeModule = ref("workspace");
const apiUrlOverride = ref(
  localStorage.getItem("kc_analyzer_api_url_override") || "",
);
const runtimeConfig = ref(
  (() => {
    try {
      const raw = localStorage.getItem("kc_analyzer_runtime_config");
      if (!raw) return { apiBaseUrl: "", apiKey: "", modelName: "" };
      const parsed = JSON.parse(raw);
      return {
        apiBaseUrl: parsed?.apiBaseUrl || "",
        apiKey: parsed?.apiKey || "",
        modelName: parsed?.modelName || "",
      };
    } catch {
      return { apiBaseUrl: "", apiKey: "", modelName: "" };
    }
  })(),
);
const apiUrl = computed(() => apiUrlOverride.value || ENV_API_URL);

// 防抖定时器
let debounceTimer = null;

// 防抖函数：防止用户快速多次点击
const debounce = (fn, delay = 500) => {
  return (...args) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

// 实际的分析函数
const analyzeCode = async () => {
  if (!codeContent.value.trim()) {
    errorMessage.value = "代码不能为空哦！";
    errorDetails.value = null;
    return;
  }

  // 防止重复请求
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  errorDetails.value = null;
  resultData.value = null;

  try {
    const response = await fetch(apiUrl.value, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: codeContent.value,
        runtimeConfig: {
          apiBaseUrl: runtimeConfig.value.apiBaseUrl || "",
          apiKey: runtimeConfig.value.apiKey || "",
          modelName: runtimeConfig.value.modelName || "",
        },
      }),
    });
    const data = await response.json();

    if (!response.ok || data.status === "error") {
      // 提取错误信息和详情
      errorMessage.value = data.message || `请求失败 (HTTP ${response.status})`;
      errorDetails.value = data.details || data;
      return;
    }

    resultData.value = data;

    // 保存到历史记录
    HistoryManager.save({
      code: codeContent.value,
      language: data.language || currentLanguage.value,
      result: data,
    });
  } catch (error) {
    errorMessage.value = `网络错误: ${error.message}`;
    errorDetails.value = {
      error: error.toString(),
      stack: error.stack,
      apiUrl: apiUrl.value,
    };
  } finally {
    isLoading.value = false;
  }
};

// 从历史记录加载
const handleLoadHistory = (record) => {
  codeContent.value = record.code;
  currentLanguage.value = record.language;
  resultData.value = record.result;
  activeModule.value = "workspace";
};

const handleModuleSelect = (index) => {
  activeModule.value = index;
};

const handleLoadExampleFromLibrary = (item) => {
  codeContent.value = item.code;
  currentLanguage.value = item.language;
  resultData.value = null;
  errorMessage.value = "";
  errorDetails.value = null;
  activeModule.value = "workspace";
};

const handleThemeFromSettings = (theme) => {
  isDark.value = theme === ThemeManager.THEMES.DARK;
};

const handleApiUrlUpdate = (url) => {
  apiUrlOverride.value = url;
};

const handleRuntimeConfigUpdate = (config) => {
  runtimeConfig.value = {
    apiBaseUrl: config?.apiBaseUrl || "",
    apiKey: config?.apiKey || "",
    modelName: config?.modelName || "",
  };
};

const handleMobileAction = (command) => {
  if (command === "history") {
    showHistory.value = true;
    return;
  }

  if (command === "theme") {
    toggleTheme();
    return;
  }

  if (command === "about") {
    showAbout.value = true;
    return;
  }

  if (command === "settings") {
    activeModule.value = "settings";
  }
};

// 主题切换
const toggleTheme = () => {
  const newTheme = ThemeManager.toggleTheme();
  isDark.value = newTheme === ThemeManager.THEMES.DARK;
};

// 初始化主题
onMounted(() => {
  ThemeManager.init();
  isDark.value = ThemeManager.getCurrentTheme() === ThemeManager.THEMES.DARK;

  // 监听主题变化
  window.addEventListener("theme-changed", (e) => {
    isDark.value = e.detail.theme === ThemeManager.THEMES.DARK;
  });
});

// 带防抖的分析处理函数
const handleAnalyze = debounce(analyzeCode, 300);
</script>

<style scoped>
.analyzer-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  margin: 0;
  color: var(--text-color, #303133);
  font-size: 28px;
  font-weight: bold;
  animation: slideDown 0.5s ease-out;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.module-menu {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  position: sticky;
  top: 0;
  z-index: 20;
  background-color: var(--card-bg, #ffffff);
}

.mobile-actions {
  display: none;
}

.workspace-layout {
  align-items: flex-start;
}

@media (min-width: 993px) {
  .workspace-col {
    max-height: calc(100vh - 220px);
    overflow-y: auto;
    padding-right: 4px;
  }
}

.action-btn {
  gap: 6px;
  transition: all 0.3s ease;
}

.action-btn .btn-text {
  display: inline;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mt-4 {
  margin-top: 16px;
}

.error-details {
  background-color: var(--hover-bg, #f5f5f5);
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-color, #606266);
  overflow-x: auto;
  max-height: 300px;
  line-height: 1.5;
}

/* 平板适配 */
@media (max-width: 992px) {
  .analyzer-container {
    padding: 15px;
  }

  .page-title {
    font-size: 24px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .analyzer-container {
    padding: 12px;
  }

  .header-section {
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .page-title {
    font-size: 20px;
    width: 100%;
  }

  .header-actions {
    gap: 8px;
  }

  .desktop-action {
    display: none;
  }

  .mobile-actions {
    display: inline-flex;
  }

  .action-btn {
    font-size: 13px;
    padding: 6px 10px;
  }

  .action-btn .btn-text {
    display: none;
  }

  :deep(.el-row) {
    margin: 0 !important;
  }

  :deep(.el-col) {
    padding: 0 !important;
    margin-bottom: 15px;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .analyzer-container {
    padding: 8px;
  }

  .header-section {
    margin-bottom: 15px;
  }

  .page-title {
    font-size: 18px;
  }
}
</style>
