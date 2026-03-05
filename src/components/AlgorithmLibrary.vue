<template>
  <el-card shadow="hover" class="library-card">
    <template #header>
      <div class="library-header">
        <div class="title-row">
          <span>📚 算法库</span>
          <el-tag type="info" effect="plain"
            >共 {{ filteredExamples.length }} 条</el-tag
          >
        </div>
        <el-input
          v-model="keyword"
          placeholder="搜索算法名称/分类"
          clearable
          class="search-input"
        />
      </div>
    </template>

    <div class="category-row">
      <el-radio-group v-model="activeCategory" size="small">
        <el-radio-button label="全部" />
        <el-radio-button
          v-for="category in categories"
          :key="category.name"
          :label="category.name"
        >
          {{ category.name }} ({{ category.count }})
        </el-radio-button>
      </el-radio-group>
    </div>

    <el-empty
      v-if="filteredExamples.length === 0"
      description="未找到匹配的算法示例"
      :image-size="80"
    />

    <div v-else class="example-grid">
      <el-card
        v-for="item in filteredExamples"
        :key="item.id"
        shadow="never"
        class="example-item"
      >
        <div class="item-title">{{ item.name }}</div>
        <div class="item-meta">
          <el-tag size="small" effect="plain">{{ item.category }}</el-tag>
          <el-tag size="small" type="success" effect="plain">{{
            item.language
          }}</el-tag>
        </div>
        <div class="item-preview">{{ getPreview(item.code) }}</div>
        <div class="item-actions">
          <el-button size="small" type="primary" @click="loadExample(item)">
            加载到编辑器
          </el-button>
        </div>
      </el-card>
    </div>
  </el-card>
</template>

<script setup>
import { computed, ref } from "vue";
import { codeExamples, getCategories } from "../utils/codeExamples.js";

const emit = defineEmits(["load-example"]);

const keyword = ref("");
const activeCategory = ref("全部");
const categories = computed(() => {
  const base = getCategories().filter((item) => item !== "全部");
  return base.map((name) => ({
    name,
    count: codeExamples.filter((item) => item.category === name).length,
  }));
});

const filteredExamples = computed(() => {
  const key = keyword.value.trim().toLowerCase();

  return codeExamples.filter((item) => {
    const categoryMatch =
      activeCategory.value === "全部" || item.category === activeCategory.value;

    const keywordMatch =
      !key ||
      item.name.toLowerCase().includes(key) ||
      item.category.toLowerCase().includes(key) ||
      item.language.toLowerCase().includes(key);

    return categoryMatch && keywordMatch;
  });
});

const getPreview = (code) => {
  const firstLine = code.split("\n")[0]?.trim() || "";
  return firstLine.length > 60 ? `${firstLine.slice(0, 60)}...` : firstLine;
};

const loadExample = (item) => {
  emit("load-example", item);
};
</script>

<style scoped>
.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.search-input {
  width: 260px;
}

.category-row {
  margin-bottom: 16px;
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.example-item {
  border: 1px solid var(--border-color, #e4e7ed);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.item-title {
  font-weight: 600;
  margin-bottom: 10px;
}

.item-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.item-preview {
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
  line-height: 1.5;
  min-height: 36px;
  line-clamp: 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

@media (max-width: 768px) {
  .library-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .example-grid {
    grid-template-columns: 1fr;
  }
}
</style>
