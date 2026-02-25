import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  // 构建优化
  build: {
    // 启用 CSS 代码分割
    cssCodeSplit: true,

    // 生成 sourcemap 用于生产环境调试
    sourcemap: false,

    // chunk 大小警告限制（KB）
    chunkSizeWarningLimit: 1000,

    // Rollup 配置
    rollupOptions: {
      output: {
        // 代码分割策略
        manualChunks: {
          // Vue 核心库
          "vue-vendor": ["vue"],
          // Element Plus UI 库
          "element-plus": ["element-plus"],
          // Monaco Editor
          "monaco-editor": ["@guolao/vue-monaco-editor"],
        },
        // 生成的文件名格式
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: "[ext]/[name]-[hash].[ext]",
      },
    },

    // 压缩配置
    minify: "terser",
    terserOptions: {
      compress: {
        // 生产环境移除 console
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  // 服务器配置
  server: {
    // 端口
    port: 5173,
    // 启动时自动打开浏览器
    open: false,
    // 代理配置（如果需要）
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3000',
    //     changeOrigin: true,
    //   },
    // },
  },

  // 预构建优化
  optimizeDeps: {
    include: ["vue", "element-plus"],
  },
});
