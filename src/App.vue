<template>
  <div class="analyzer-container">
    <h2 class="page-title">🚀 AI 算法解析引擎</h2>

    <el-row :gutter="20">
      <el-col :xs="24" :md="10">
        <el-card shadow="hover" class="box-card">
          <template #header>
            <div class="card-header">
              <span>👨‍💻 算法代码</span>
              <el-button
                type="primary"
                :loading="isLoading"
                @click="analyzeCode"
              >
                开始解析
              </el-button>
            </div>
          </template>

          <div class="editor-wrapper">
            <vue-monaco-editor
              v-model:value="codeContent"
              theme="vs-dark"
              language="cpp"
              :options="editorOptions"
            />
          </div>
        </el-card>

        <el-alert
          v-if="errorMessage"
          :title="errorMessage"
          type="error"
          show-icon
          class="mt-4"
        />
      </el-col>

      <el-col :xs="24" :md="14">
        <el-empty
          v-if="!resultData && !isLoading"
          description="等待输入代码进行解析..."
        />
        <el-skeleton :rows="10" animated v-if="isLoading" class="mt-4" />

        <div v-if="resultData && !isLoading" class="result-area">
          <el-row :gutter="15" class="mb-4">
            <el-col :span="12">
              <el-card shadow="never" class="metric-card">
                <div class="metric-title">⏱️ 时间复杂度</div>
                <div class="metric-value">{{ resultData.complexity.time }}</div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card shadow="never" class="metric-card">
                <div class="metric-title">💾 空间复杂度</div>
                <div class="metric-value">
                  {{ resultData.complexity.space }}
                </div>
              </el-card>
            </el-col>
            <el-col :span="24" class="mt-2">
              <el-alert
                :title="resultData.complexity.explanation"
                type="info"
                :closable="false"
              />
            </el-col>
          </el-row>

          <el-card shadow="hover" class="timeline-card mb-4">
            <template #header>
              <span>🔍 运行步骤推演 (代入实值)</span>
              <el-tag type="success" style="float: right">{{
                resultData.language
              }}</el-tag>
            </template>

            <el-timeline>
              <el-timeline-item
                v-for="step in resultData.step_by_step"
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

          <el-card shadow="hover">
            <template #header
              ><span
                >💡 优化建议 (评级: {{ resultData.rating }})</span
              ></template
            >
            <p style="line-height: 1.6; color: #606266">
              {{ resultData.optimization }}
            </p>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from "vue";
// 引入 Monaco Editor 组件
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";

const API_URL = "https://kc-analyzer.gc2839474636.workers.dev";

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

// Monaco 编辑器配置参数
const editorOptions = ref({
  automaticLayout: true, // 自动适配父容器大小
  minimap: { enabled: false }, // 关闭右侧小地图，让主代码区更宽敞
  fontSize: 15, // 字体大小
  fontFamily: "Fira Code, Consolas, monospace",
  scrollBeyondLastLine: false, // 消除代码底部大段空白
  wordWrap: "on", // 自动换行
  renderLineHighlight: "all", // 高亮当前行
});

const analyzeCode = async () => {
  if (!codeContent.value.trim()) {
    errorMessage.value = "代码不能为空哦！";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  resultData.value = null;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: codeContent.value }),
    });
    const data = await response.json();
    if (!response.ok || data.status === "error") {
      throw new Error(data.message || "解析失败");
    }
    resultData.value = data;
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.analyzer-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}
.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

/* 必须给 Monaco 编辑器一个外层确定的高度 */
.editor-wrapper {
  height: 600px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}

.mt-4 {
  margin-top: 16px;
}
.mt-2 {
  margin-top: 8px;
}
.mb-4 {
  margin-bottom: 16px;
}

.metric-card {
  text-align: center;
  background-color: #f8f9fa;
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
}

.step-card {
  margin-bottom: 5px;
}
.step-card h4 {
  margin: 0 0 10px 0;
  color: #303133;
}
.description {
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
}
.meta-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.variables {
  background-color: #282c34;
  color: #98c379; /* 变成代码高亮的绿色，视觉上更清晰 */
  padding: 8px 12px;
  border-radius: 4px;
  font-family: Consolas, monospace;
  font-size: 14px;
  font-weight: bold;
  overflow-x: auto;
}
</style>
