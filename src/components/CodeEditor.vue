<template>
  <el-card shadow="hover" class="box-card">
    <template #header>
      <div class="card-header">
        <span class="header-title">👨‍💻 算法代码</span>
        <div class="header-actions">
          <el-select
            v-model="selectedLanguage"
            placeholder="选择语言"
            class="language-select"
            size="default"
          >
            <el-option
              v-for="lang in languages"
              :key="lang.value"
              :label="lang.label"
              :value="lang.value"
            >
              <span>{{ lang.icon }} {{ lang.label }}</span>
            </el-option>
          </el-select>
          <el-button type="primary" :loading="loading" @click="handleAnalyze">
            开始解析
          </el-button>
        </div>
      </div>
    </template>

    <!-- 示例代码选择器 -->
    <div class="example-selector">
      <el-select
        v-model="selectedExample"
        placeholder="📚 选择示例代码..."
        clearable
        filterable
        style="width: 100%"
        @change="loadExample"
      >
        <el-option-group
          v-for="category in categories"
          :key="category"
          :label="category"
        >
          <el-option
            v-for="example in getExamplesByCategory(category)"
            :key="example.id"
            :label="example.name"
            :value="example.id"
          >
            <span style="float: left">{{ example.name }}</span>
            <span
              style="
                float: right;
                color: var(--el-text-color-secondary);
                font-size: 13px;
              "
            >
              {{ getLanguageIcon(example.language) }}
            </span>
          </el-option>
        </el-option-group>
      </el-select>
    </div>

    <div class="editor-wrapper">
      <vue-monaco-editor
        v-if="editorReady"
        v-model:value="localCode"
        :theme="monacoTheme"
        :language="selectedLanguage"
        :options="editorOptions"
        @mount="handleEditorMount"
      />
      <!-- 编辑器加载骨架屏 -->
      <div v-else class="editor-skeleton">
        <div class="skeleton-header">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line shorter"></div>
        </div>
        <div class="skeleton-content">
          <div
            v-for="i in 12"
            :key="i"
            class="skeleton-line"
            :class="getSkeletonClass(i)"
          ></div>
        </div>
        <div class="skeleton-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>编辑器加载中...</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { Loading } from "@element-plus/icons-vue";
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";
import { codeExamples } from "../utils/codeExamples.js";

const props = defineProps({
  code: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  theme: {
    type: String,
    default: "light", // 'light' 或 'dark'
  },
});

const emit = defineEmits(["update:code", "analyze"]);

const selectedLanguage = ref("cpp");
const localCode = ref(props.code);
const selectedExample = ref("");
const editorReady = ref(false);

// Monaco Editor 主题映射
const monacoTheme = computed(() => {
  return props.theme === "dark" ? "vs-dark" : "vs";
});

// 支持的语言列表
const languages = [
  { label: "C++", value: "cpp", icon: "🔷" },
  { label: "Python", value: "python", icon: "🐍" },
  { label: "JavaScript", value: "javascript", icon: "💛" },
  { label: "Java", value: "java", icon: "☕" },
  { label: "Go", value: "go", icon: "🔵" },
  { label: "Rust", value: "rust", icon: "🦀" },
  { label: "TypeScript", value: "typescript", icon: "💙" },
  { label: "C", value: "c", icon: "⚙️" },
];

// 获取分类列表
const categories = computed(() => {
  const cats = new Set(codeExamples.map((ex) => ex.category));
  return Array.from(cats);
});

// 延迟加载编辑器
onMounted(() => {
  // 使用 requestIdleCallback 在浏览器空闲时加载
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      setTimeout(() => {
        editorReady.value = true;
      }, 100);
    });
  } else {
    // 降级方案
    setTimeout(() => {
      editorReady.value = true;
    }, 300);
  }
});

// 编辑器挂载完成
const handleEditorMount = () => {
  console.log("Monaco Editor 已加载");
};

// 骨架屏样式类
const getSkeletonClass = (index) => {
  const classes = ["full", "long", "medium", "short"];
  return classes[index % classes.length];
};

// 根据分类获取示例
const getExamplesByCategory = (category) => {
  return codeExamples.filter((ex) => ex.category === category);
};

// 获取语言图标
const getLanguageIcon = (lang) => {
  const language = languages.find((l) => l.value === lang);
  return language ? language.icon : "📄";
};

// 加载示例代码
const loadExample = (exampleId) => {
  if (!exampleId) return;

  const example = codeExamples.find((ex) => ex.id === exampleId);
  if (example) {
    localCode.value = example.code;
    selectedLanguage.value = example.language;
  }
};

// Monaco 编辑器配置
const editorOptions = ref({
  automaticLayout: true,
  minimap: { enabled: false },
  fontSize: 15,
  fontFamily: "Fira Code, Consolas, monospace",
  scrollBeyondLastLine: false,
  wordWrap: "on",
  renderLineHighlight: "all",
  tabSize: 4,
  insertSpaces: true,
  lineNumbers: "on",
  roundedSelection: true,
  cursorBlinking: "smooth",
});

// 监听本地代码变化，同步到父组件
watch(localCode, (newValue) => {
  emit("update:code", newValue);
});

// 监听父组件代码变化
watch(
  () => props.code,
  (newValue) => {
    if (newValue !== localCode.value) {
      localCode.value = newValue;
    }
  },
);

const handleAnalyze = () => {
  emit("analyze");
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  flex-wrap: wrap;
  gap: 10px;
}

.header-title {
  font-size: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.language-select {
  width: 140px;
}

.example-selector {
  margin-bottom: 12px;
  padding: 0 0 12px 0;
  border-bottom: 1px dashed #e4e7ed;
}

.editor-wrapper {
  height: 600px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  position: relative;
}

/* 编辑器骨架屏 */
.editor-skeleton {
  width: 100%;
  height: 100%;
  background-color: #1e1e1e;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.skeleton-header {
  margin-bottom: 20px;
}

.skeleton-content {
  flex: 1;
  overflow: hidden;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #2d2d2d 25%, #3a3a3a 50%, #2d2d2d 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-line.full {
  width: 95%;
}

.skeleton-line.long {
  width: 80%;
}

.skeleton-line.medium {
  width: 65%;
}

.skeleton-line.short {
  width: 50%;
}

.skeleton-line.shorter {
  width: 30%;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-loading {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.skeleton-loading .el-icon {
  font-size: 18px;
}

/* 平板适配 */
@media (max-width: 992px) {
  .editor-wrapper {
    height: 500px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-title {
    text-align: center;
    margin-bottom: 5px;
  }

  .header-actions {
    justify-content: center;
    width: 100%;
  }

  .language-select {
    flex: 1;
    min-width: 120px;
  }

  .editor-wrapper {
    height: 350px;
  }

  .example-selector {
    margin-bottom: 10px;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .language-select {
    width: 100%;
  }

  .header-actions :deep(.el-button) {
    width: 100%;
  }

  .editor-wrapper {
    height: 300px;
  }
}
</style>
