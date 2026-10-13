import { uploadToTOS } from '~/server/utils/tos';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    if (!await getCurrentUser(event)) {
      throw createError({ statusCode: 401, statusMessage: '未登录' });
    }
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: '未找到上传文件' });
    }

    const file = formData.find(f => f.name === 'file');
    if (!file || !file.filename) {
      throw createError({ statusCode: 400, statusMessage: '未找到上传文件' });
    }

    // Validate file type
    const allowedTypes = [
      'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip', 'application/x-zip-compressed',
      'text/plain', 'text/markdown',
      'application/json',
      'application/x-7z-compressed'
    ];

    if (file.type && !allowedTypes.includes(file.type)) {
      throw createError({ statusCode: 400, statusMessage: `不支持的文件类型: ${file.type}` });
    }

    // Limit file size to 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.data.length > maxSize) {
      throw createError({ statusCode: 400, statusMessage: '文件大小不能超过 10MB' });
    }

    // 上传到火山引擎 TOS
    const { url } = await uploadToTOS(file.data, file.filename, file.type);

    return {
      url,
      filename: file.filename,
      size: file.data.length,
      type: file.type || 'application/octet-stream'
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '文件上传失败'
    });
  }
});
