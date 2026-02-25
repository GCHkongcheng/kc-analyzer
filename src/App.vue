<template>
  <div class="analyzer-container">
    <div class="header-section">
      <h2 class="page-title">🚀 AI 算法解析引擎</h2>
      <el-button
        type="primary"
        plain
        class="history-btn"
        @click="showHistory = true"
      >
        <el-icon><Clock /></el-icon>
        <span class="btn-text">历史记录</span>
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :md="10">
        <CodeEditor
          v-model:code="codeContent"
          :loading="isLoading"
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

      <el-col :xs="24" :md="14">
        <ResultPanel :resultData="resultData" :loading="isLoading" />
      </el-col>
    </el-row>

    <!-- 历史记录抽屉 -->
    <HistoryDrawer v-model="showHistory" @load="handleLoadHistory" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Clock } from "@element-plus/icons-vue";
import CodeEditor from "./components/CodeEditor.vue";
import ResultPanel from "./components/ResultPanel.vue";
import HistoryDrawer from "./components/HistoryDrawer.vue";
import { HistoryManager } from "./utils/historyManager.js";

// 从环境变量读取 API URL
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://kc-analyzer.gc2839474636.workers.dev";

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
const currentLanguage = ref("cpp"); // 追踪当前语言

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
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: codeContent.value }),
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
      apiUrl: API_URL,
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
};

// 带防抖的分析处理函数
const handleAnalyze = debounce(analyzeCode, 300);
</script>

<style scoped>
.analyzer-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  margin: 0;
  color: #303133;
  font-size: 28px;
  font-weight: bold;
  animation: slideDown 0.5s ease-out;
}

.history-btn {
  gap: 6px;
}

.history-btn .btn-text {
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
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
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
  }

  .page-title {
    font-size: 20px;
  }

  .history-btn .btn-text {
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
