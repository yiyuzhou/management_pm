export function pickLatestIteration<T extends { id: number | string; start_date?: string | null; created_at?: string | null }>(
  iterations: T[] | null | undefined
): T | null {
  if (!iterations?.length) return null
  return [...iterations].sort((a, b) => {
    const ta = new Date(a.start_date || a.created_at || 0).getTime()
    const tb = new Date(b.start_date || b.created_at || 0).getTime()
    if (tb !== ta) return tb - ta
    return Number(b.id) - Number(a.id)
  })[0]
}
