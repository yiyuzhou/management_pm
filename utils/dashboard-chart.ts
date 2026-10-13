export interface IterationRequirementPoint {
  id: number
  name: string
  total: number
  done: number
}

export function niceMax(value: number) {
  if (value <= 0) return 4
  const padded = value * 1.15
  const magnitude = 10 ** Math.floor(Math.log10(padded))
  const normalized = padded / magnitude
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return nice * magnitude
}

export function chartLayout(count: number, width = 960, height = 280) {
  const padding = { top: 20, right: 20, bottom: 40, left: 40 }
  const innerWidth = Math.max(width - padding.left - padding.right, 1)
  const innerHeight = Math.max(height - padding.top - padding.bottom, 1)
  const slot = count > 0 ? innerWidth / count : innerWidth
  const barWidth = Math.min(64, Math.max(28, slot * 0.28))
  return { padding, innerWidth, innerHeight, slot, barWidth, width, height }
}
