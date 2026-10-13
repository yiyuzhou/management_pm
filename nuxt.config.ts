export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },
  vite: {
    server: {
      allowedHosts: true
    }
  },
  css: ['~/assets/css/main.css'],
  build: {
    transpile: ['@wangeditor/editor', '@wangeditor/editor-for-vue']
  },
  app: {
    head: {
      title: '需求池 - 产品设计管理平台',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  runtimeConfig: {
    // 服务端私有配置（不暴露给前端）
    tos: {
      endpoint: process.env.TOS_ENDPOINT || 'tos-cn-guangzhou.volces.com',
      domain: process.env.TOS_DOMAIN || 'https://dev-1321001571.tos-cn-guangzhou.volces.com',
      bucket: process.env.TOS_BUCKET || 'dev-1321001571',
      accessKey: process.env.TOS_ACCESS_KEY || '',
      accessSecret: process.env.TOS_ACCESS_SECRET || '',
      region: process.env.TOS_REGION || 'cn-guangzhou',
    }
  }
})
