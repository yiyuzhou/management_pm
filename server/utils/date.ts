/**
 * 将各种日期格式规范化为 MySQL DATE 列可接受的 'YYYY-MM-DD' 字符串。
 *
 * 处理场景：
 * - ISO 8601 字符串（含时间部分和时区）：'2026-07-06T16:00:00.000Z' → '2026-07-06'
 * - 纯日期字符串：'2026-07-06' → '2026-07-06'
 * - Date 对象：转为 YYYY-MM-DD
 * - null/undefined/空字符串：返回 null（SQL NULL）
 *
 * @param value 任意日期值
 * @returns 'YYYY-MM-DD' 字符串或 null
 */
export function normalizeDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Date 对象
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 字符串
  const str = String(value);
  if (!str) return null;

  // 提取前 10 个字符（YYYY-MM-DD 部分），兼容 'YYYY-MM-DD' 和 'YYYY-MM-DDTHH:mm:ss.sssZ'
  const datePart = str.slice(0, 10);

  // 验证格式
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return datePart;
  }

  // 尝试解析
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}
