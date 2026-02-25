// 历史记录管理工具
const STORAGE_KEY = "kc_analyzer_history";
const MAX_HISTORY = 10; // 最多保存 10 条记录

export class HistoryManager {
  /**
   * 保存分析记录
   * @param {Object} record - 分析记录
   * @param {string} record.code - 代码
   * @param {string} record.language - 语言
   * @param {Object} record.result - 分析结果
   */
  static save(record) {
    const history = this.getAll();

    // 创建新记录
    const newRecord = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      code: record.code,
      language: record.language,
      result: record.result,
      // 生成简短的代码预览
      preview: this.generatePreview(record.code),
    };

    // 添加到历史记录开头
    history.unshift(newRecord);

    // 限制记录数量
    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY);
    }

    // 保存到 LocalStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error("保存历史记录失败:", error);
      return false;
    }
  }

  /**
   * 获取所有历史记录
   * @returns {Array} 历史记录数组
   */
  static getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("读取历史记录失败:", error);
      return [];
    }
  }

  /**
   * 根据 ID 获取记录
   * @param {number} id - 记录 ID
   * @returns {Object|null} 记录对象
   */
  static getById(id) {
    const history = this.getAll();
    return history.find((record) => record.id === id) || null;
  }

  /**
   * 删除指定记录
   * @param {number} id - 记录 ID
   * @returns {boolean} 是否成功
   */
  static delete(id) {
    try {
      const history = this.getAll();
      const filtered = history.filter((record) => record.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("删除记录失败:", error);
      return false;
    }
  }

  /**
   * 清空所有历史记录
   * @returns {boolean} 是否成功
   */
  static clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("清空历史记录失败:", error);
      return false;
    }
  }

  /**
   * 生成代码预览（前 50 个字符）
   * @param {string} code - 完整代码
   * @returns {string} 预览文本
   */
  static generatePreview(code) {
    const cleaned = code.trim().replace(/\s+/g, " ");
    return cleaned.length > 50 ? cleaned.slice(0, 50) + "..." : cleaned;
  }

  /**
   * 格式化时间戳为可读格式
   * @param {string} timestamp - ISO 时间戳
   * @returns {string} 格式化后的时间
   */
  static formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // 1 分钟内
    if (diff < 60000) {
      return "刚刚";
    }
    // 1 小时内
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分钟前`;
    }
    // 24 小时内
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小时前`;
    }
    // 超过 24 小时
    return date.toLocaleString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
