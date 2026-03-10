<template>
  <el-card shadow="hover" class="settings-card">
    <template #header>
      <span>⚙️ 系统设置</span>
    </template>

    <el-form label-width="120px" class="settings-form">
      <el-form-item label="主题模式">
        <el-radio-group v-model="localTheme" @change="handleThemeChange">
          <el-radio-button label="light">浅色</el-radio-button>
          <el-radio-button label="dark">深色</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="后端网关 URL">
        <el-input
          v-model="localApiUrl"
          placeholder="填写 Worker 地址，留空使用 .env 的 VITE_API_URL"
          clearable
        />
        <div class="form-tip">
          这里填你的 Worker 网关地址，不是模型厂商 API 地址。
        </div>
      </el-form-item>

      <el-form-item label="AI Base URL">
        <el-input
          v-model="localApiBaseUrl"
          placeholder="如: https://api.openai.com/v1/chat/completions"
          clearable
        />
        <div class="form-tip">可选：覆盖 Worker 默认 API_BASE_URL。</div>
      </el-form-item>

      <el-form-item label="AI API Key">
        <el-input
          v-model="localApiKey"
          :type="showApiKey ? 'text' : 'password'"
          placeholder="可选：临时覆盖 Worker 默认 API_KEY"
          clearable
        >
          <template #append>
            <el-button @click="showApiKey = !showApiKey">
              {{ showApiKey ? "隐藏" : "显示" }}
            </el-button>
          </template>
        </el-input>
        <div class="form-tip warning-tip">
          安全提示：前端保存 Key 有泄露风险，仅建议开发调试时使用。
        </div>
      </el-form-item>

      <el-form-item label="模型名称">
        <el-input
          v-model="localModelName"
          placeholder="如: gpt-4o-mini / deepseek-chat"
          clearable
        />
      </el-form-item>

      <el-form-item label="历史记录">
        <div class="history-row">
          <el-tag type="info">当前 {{ historyCount }} 条</el-tag>
          <el-button type="danger" plain @click="clearHistory">
            清空历史
          </el-button>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
        <el-button @click="resetSettings">恢复默认</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { ThemeManager } from "../utils/themeManager.js";
import { HistoryManager } from "../utils/historyManager.js";

const props = defineProps({
  theme: {
    type: String,
    default: "light",
  },
  apiUrlOverride: {
    type: String,
    default: "",
  },
  runtimeConfig: {
    type: Object,
    default: () => ({
      apiBaseUrl: "",
      apiKey: "",
      modelName: "",
    }),
  },
});

const emit = defineEmits([
  "update-theme",
  "update-api-url",
  "update-runtime-config",
]);

const localTheme = ref(props.theme);
const localApiUrl = ref(props.apiUrlOverride);
const localApiBaseUrl = ref(props.runtimeConfig?.apiBaseUrl || "");
const localApiKey = ref(props.runtimeConfig?.apiKey || "");
const localModelName = ref(props.runtimeConfig?.modelName || "");
const showApiKey = ref(false);
const historyCount = ref(HistoryManager.getAll().length);

watch(
  () => props.theme,
  (val) => {
    localTheme.value = val;
  },
);

watch(
  () => props.apiUrlOverride,
  (val) => {
    localApiUrl.value = val;
  },
);

watch(
  () => props.runtimeConfig,
  (val) => {
    localApiBaseUrl.value = val?.apiBaseUrl || "";
    localApiKey.value = val?.apiKey || "";
    localModelName.value = val?.modelName || "";
  },
  { deep: true },
);

const handleThemeChange = (theme) => {
  ThemeManager.setTheme(theme);
  emit("update-theme", theme);
};

const clearHistory = async () => {
  try {
    await ElMessageBox.confirm("确定清空所有历史记录吗？", "提示", {
      type: "warning",
      confirmButtonText: "清空",
      cancelButtonText: "取消",
    });

    HistoryManager.clear();
    historyCount.value = 0;
    ElMessage.success("历史记录已清空");
  } catch {
    // 用户取消
  }
};

const saveSettings = () => {
  localStorage.setItem(
    "kc_analyzer_api_url_override",
    localApiUrl.value.trim(),
  );
  localStorage.setItem(
    "kc_analyzer_runtime_config",
    JSON.stringify({
      apiBaseUrl: localApiBaseUrl.value.trim(),
      apiKey: localApiKey.value.trim(),
      modelName: localModelName.value.trim(),
    }),
  );

  emit("update-api-url", localApiUrl.value.trim());
  emit("update-runtime-config", {
    apiBaseUrl: localApiBaseUrl.value.trim(),
    apiKey: localApiKey.value.trim(),
    modelName: localModelName.value.trim(),
  });

  ElMessage.success("设置已保存");
};

const resetSettings = () => {
  localApiUrl.value = "";
  localApiBaseUrl.value = "";
  localApiKey.value = "";
  localModelName.value = "";
  localStorage.removeItem("kc_analyzer_api_url_override");
  localStorage.removeItem("kc_analyzer_runtime_config");
  emit("update-api-url", "");
  emit("update-runtime-config", {
    apiBaseUrl: "",
    apiKey: "",
    modelName: "",
  });

  ThemeManager.setTheme(ThemeManager.THEMES.LIGHT);
  localTheme.value = ThemeManager.THEMES.LIGHT;
  emit("update-theme", ThemeManager.THEMES.LIGHT);

  ElMessage.success("已恢复默认设置");
};
</script>

<style scoped>
.settings-card {
  max-width: 900px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

.warning-tip {
  color: #e6a23c;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
