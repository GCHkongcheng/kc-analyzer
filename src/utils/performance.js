// 性能优化工具集

/**
 * 节流函数 - 限制函数在指定时间内只能执行一次
 * @param {Function} fn - 要节流的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, delay = 300) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 防抖函数 - 延迟执行，如果在延迟期间再次触发则重新计时
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 图片懒加载
 * @param {string} selector - 图片选择器
 */
export function lazyLoadImages(selector = "img[data-src]") {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll(selector).forEach((img) => {
      imageObserver.observe(img);
    });
  } else {
    // 降级方案：直接加载所有图片
    document.querySelectorAll(selector).forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  }
}

/**
 * 监听性能指标
 * @returns {Object} 性能数据
 */
export function monitorPerformance() {
  if (!("performance" in window)) return null;

  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  const connectTime = perfData.responseEnd - perfData.requestStart;
  const renderTime = perfData.domComplete - perfData.domLoading;

  return {
    // 页面加载总时间
    pageLoadTime,
    // 服务器连接时间
    connectTime,
    // 页面渲染时间
    renderTime,
    // DNS 查询时间
    dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,
    // TCP 连接时间
    tcpTime: perfData.connectEnd - perfData.connectStart,
    // 首次渲染时间
    firstPaint: perfData.responseStart - perfData.navigationStart,
  };
}

/**
 * 预加载资源
 * @param {string} href - 资源路径
 * @param {string} as - 资源类型 (script, style, image, font 等)
 */
export function preloadResource(href, as = "script") {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = as;
  link.href = href;
  document.head.appendChild(link);
}

/**
 * 检测网络状态
 * @returns {Object} 网络信息
 */
export function getNetworkInfo() {
  if (!("connection" in navigator)) {
    return { type: "unknown", effectiveType: "unknown" };
  }

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  return {
    type: connection.type || "unknown",
    effectiveType: connection.effectiveType || "unknown",
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false,
  };
}

/**
 * 内存使用监控（仅 Chrome）
 * @returns {Object|null} 内存信息
 */
export function getMemoryInfo() {
  if ("memory" in performance) {
    const memory = performance.memory;
    return {
      // 已使用的 JS 堆大小
      usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2) + " MB",
      // JS 堆大小限制
      totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2) + " MB",
      // JS 堆大小上限
      jsHeapSizeLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + " MB",
      // 使用率
      usagePercent: (
        (memory.usedJSHeapSize / memory.jsHeapSizeLimit) *
        100
      ).toFixed(2),
    };
  }
  return null;
}

/**
 * 长列表虚拟滚动辅助函数
 * @param {Array} list - 完整列表
 * @param {number} startIndex - 起始索引
 * @param {number} endIndex - 结束索引
 * @returns {Array} 可见列表项
 */
export function getVisibleItems(list, startIndex, endIndex) {
  return list.slice(startIndex, endIndex);
}

/**
 * 代码分割 - 动态导入组件
 * @param {string} path - 组件路径
 * @returns {Promise} 组件 Promise
 */
export function lazyLoadComponent(path) {
  return () => import(path);
}

// 性能优化建议
export const performanceTips = {
  // 是否启用 Web Workers
  useWebWorkers: "Worker" in window,
  // 是否支持 Service Worker
  supportServiceWorker: "serviceWorker" in navigator,
  // 是否支持 WebAssembly
  supportWebAssembly: typeof WebAssembly !== "undefined",
  // 是否支持 HTTP/2
  supportHTTP2: window.fetch && "Request" in window,
  // 设备内存（GB）
  deviceMemory: navigator.deviceMemory || "unknown",
  // CPU 核心数
  hardwareConcurrency: navigator.hardwareConcurrency || "unknown",
};
