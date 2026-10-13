# 去掉 API 响应信封，直接返回数据

所有 server API 去掉 `{ code, data, message }` 包装，直接返回数据体。错误通过 `createError({ statusCode, statusMessage })` 抛出，由 Nuxt/Nitro 统一转为 HTTP 错误响应。

之前代码中 `MetaResponse` 类型定义与实际 API 返回结构不一致（类型声明无信封，实际返回有信封），导致部分页面用 `meta?.users`（按类型）、部分页面用 `meta?.data?.users`（按实际）访问，产生大面积 bug。去掉信封后，类型定义与实际数据结构一致，`useFetch<T>('/api/xxx')` 的泛型 `T` 即为真实数据结构。
