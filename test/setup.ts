import { defineEventHandler, getQuery, getRouterParam, createError, readBody } from 'h3'

/**
 * Provide h3/Nitro globals that Nuxt auto-imports in server context.
 * This lets us import and test server API handlers directly in vitest
 * without booting the full Nuxt server.
 */
;(globalThis as any).defineEventHandler = defineEventHandler
;(globalThis as any).getQuery = getQuery
;(globalThis as any).getRouterParam = getRouterParam
;(globalThis as any).createError = createError
;(globalThis as any).readBody = readBody
