export const SELECTED_PROJECT_STORAGE_KEY = 'rdm:selected-project-id'

export function parseStoredProjectId(raw: string | null | undefined): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}
