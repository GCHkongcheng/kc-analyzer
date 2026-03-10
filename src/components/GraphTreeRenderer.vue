<template>
  <el-card shadow="hover" class="graph-tree-card">
    <template #header>
      <div class="card-header">
        <span>{{
          renderType === "tree" ? "🌳 树结构可视化" : "🕸️ 图结构可视化"
        }}</span>
        <el-tag size="small" effect="plain">{{ renderType }}</el-tag>
      </div>
    </template>

    <div ref="chartRef" class="chart-container"></div>

    <el-alert
      v-if="showFallbackNotice"
      class="fallback-alert"
      type="info"
      :closable="false"
      show-icon
      title="当前结果缺少完整图结构数据"
    >
      <template #default>
        已使用步骤序列生成临时可视化。若要高质量图形，请让后端返回
        visualization.nodes / visualization.edges。
      </template>
    </el-alert>
  </el-card>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import * as echarts from "echarts";

const props = defineProps({
  renderType: {
    type: String,
    default: "graph", // tree | graph
  },
  steps: {
    type: Array,
    default: () => [],
  },
  visualizationData: {
    type: Object,
    default: null,
  },
});

const chartRef = ref(null);
let chartInstance = null;

const normalizedData = computed(() => {
  const viz = props.visualizationData;
  if (viz && Array.isArray(viz.nodes) && Array.isArray(viz.edges)) {
    return {
      fromBackend: true,
      nodes: viz.nodes,
      edges: viz.edges,
      rootId: viz.rootId,
    };
  }

  // 回退：根据步骤构造线性链路图，保证视觉可用
  const nodes = props.steps.map((step, index) => ({
    id: String(step?.step ?? index + 1),
    name: `S${step?.step ?? index + 1}: ${step?.action || "步骤"}`,
    value: step?.description || "",
    category: props.renderType,
    symbolSize: 44,
  }));

  const edges = [];
  for (let i = 1; i < nodes.length; i++) {
    edges.push({
      source: nodes[i - 1].id,
      target: nodes[i].id,
      label: { show: false },
    });
  }

  return {
    fromBackend: false,
    nodes,
    edges,
    rootId: nodes[0]?.id,
  };
});

const showFallbackNotice = computed(
  () => !normalizedData.value.fromBackend && props.steps.length > 0,
);

const buildTreeOption = () => {
  const data = normalizedData.value;

  const map = new Map();
  data.nodes.forEach((node) => {
    map.set(String(node.id), {
      name: node.name || String(node.id),
      value: node.value || "",
      children: [],
    });
  });

  data.edges.forEach((edge) => {
    const source = map.get(String(edge.source));
    const target = map.get(String(edge.target));
    if (source && target) {
      source.children.push(target);
    }
  });

  const root = map.get(String(data.rootId)) || map.values().next().value;

  return {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const value = params?.data?.value || "";
        return `<b>${params.name}</b>${value ? `<br/>${value}` : ""}`;
      },
    },
    series: [
      {
        type: "tree",
        data: root ? [root] : [],
        top: "5%",
        left: "8%",
        bottom: "5%",
        right: "12%",
        symbolSize: 9,
        orient: "LR",
        label: {
          position: "left",
          verticalAlign: "middle",
          align: "right",
          fontSize: 12,
        },
        leaves: {
          label: {
            position: "right",
            verticalAlign: "middle",
            align: "left",
          },
        },
        emphasis: { focus: "descendant" },
        expandAndCollapse: true,
        initialTreeDepth: 3,
        animationDuration: 450,
        animationDurationUpdate: 650,
      },
    ],
  };
};

const buildGraphOption = () => {
  const data = normalizedData.value;

  return {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        if (params.dataType === "edge") {
          return `${params.data.source} -> ${params.data.target}`;
        }
        return `<b>${params.name}</b>${params.data?.value ? `<br/>${params.data.value}` : ""}`;
      },
    },
    series: [
      {
        type: "graph",
        layout: "force",
        roam: true,
        draggable: true,
        label: { show: true, fontSize: 12 },
        force: {
          repulsion: 220,
          edgeLength: [80, 160],
        },
        lineStyle: {
          color: "#94a3b8",
          width: 1.5,
          curveness: 0.08,
        },
        emphasis: {
          focus: "adjacency",
          lineStyle: { width: 2.5 },
        },
        data: data.nodes,
        links: data.edges,
      },
    ],
  };
};

const renderChart = async () => {
  await nextTick();
  if (!chartRef.value) return;

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value);
  }

  const option =
    props.renderType === "tree" ? buildTreeOption() : buildGraphOption();
  chartInstance.setOption(option, true);
};

const handleResize = () => {
  chartInstance?.resize();
};

onMounted(() => {
  renderChart();
  window.addEventListener("resize", handleResize);
});

watch(
  () => [props.renderType, props.steps, props.visualizationData],
  () => {
    renderChart();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style scoped>
.graph-tree-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 420px;
}

.fallback-alert {
  margin-top: 12px;
}

@media (max-width: 768px) {
  .chart-container {
    height: 320px;
  }
}
</style>
