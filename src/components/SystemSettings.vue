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

      <el-form-item label="API 地址覆盖">
        <el-input
          v-model="localApiUrl"
          placeholder="留空使用 .env 的 VITE_API_URL"
          clearable
        />
        <div class="form-tip">用于临时切换测试环境，保存后立即生效。</div>
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
});

const emit = defineEmits(["update-theme", "update-api-url"]);

const localTheme = ref(props.theme);
const localApiUrl = ref(props.apiUrlOverride);
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
  emit("update-api-url", localApiUrl.value.trim());
  ElMessage.success("设置已保存");
};

const resetSettings = () => {
  localApiUrl.value = "";
  localStorage.removeItem("kc_analyzer_api_url_override");
  emit("update-api-url", "");

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

.history-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
