import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style.css";
import App from "./App.vue";
import { ThemeManager } from "./utils/themeManager.js";

// 初始化主题（在应用挂载前执行，避免闪烁）
ThemeManager.init();

const app = createApp(App);

app.use(ElementPlus);
app.mount("#app");
