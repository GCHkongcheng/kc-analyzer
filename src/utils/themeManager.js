// 主题管理工具
const THEME_KEY = "kc_analyzer_theme";
const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

export class ThemeManager {
  /**
   * 获取当前主题
   * @returns {string} 主题名称
   */
  static getCurrentTheme() {
    // 优先从 localStorage 读取
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && (saved === THEMES.LIGHT || saved === THEMES.DARK)) {
      return saved;
    }

    // 检测系统主题偏好
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return THEMES.DARK;
    }

    // 默认浅色主题
    return THEMES.LIGHT;
  }

  /**
   * 设置主题
   * @param {string} theme - 主题名称 (light/dark)
   */
  static setTheme(theme) {
    if (theme !== THEMES.LIGHT && theme !== THEMES.DARK) {
      console.error("无效的主题名称:", theme);
      return;
    }

    // 保存到 localStorage
    localStorage.setItem(THEME_KEY, theme);

    // 更新 HTML 根元素的 class
    document.documentElement.className = theme === THEMES.DARK ? "dark" : "";

    // 更新 HTML 的 data-theme 属性（用于 CSS 变量）
    document.documentElement.setAttribute("data-theme", theme);

    // 触发自定义事件，通知其他组件
    window.dispatchEvent(
      new CustomEvent("theme-changed", { detail: { theme } }),
    );
  }

  /**
   * 切换主题
   * @returns {string} 切换后的主题
   */
  static toggleTheme() {
    const current = this.getCurrentTheme();
    const newTheme = current === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    this.setTheme(newTheme);
    return newTheme;
  }

  /**
   * 监听系统主题变化
   * @param {Function} callback - 主题变化时的回调函数
   */
  static watchSystemTheme(callback) {
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

      // 监听变化
      const handler = (e) => {
        const systemTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
        callback(systemTheme);
      };

      // 添加监听器（兼容新旧浏览器）
      if (darkModeQuery.addEventListener) {
        darkModeQuery.addEventListener("change", handler);
      } else if (darkModeQuery.addListener) {
        darkModeQuery.addListener(handler);
      }

      // 返回取消监听的函数
      return () => {
        if (darkModeQuery.removeEventListener) {
          darkModeQuery.removeEventListener("change", handler);
        } else if (darkModeQuery.removeListener) {
          darkModeQuery.removeListener(handler);
        }
      };
    }
    return () => {};
  }

  /**
   * 初始化主题
   */
  static init() {
    const theme = this.getCurrentTheme();
    this.setTheme(theme);
  }

  /**
   * 获取主题常量
   */
  static get THEMES() {
    return THEMES;
  }
}

// 导出主题常量
export { THEMES };
