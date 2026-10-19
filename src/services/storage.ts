import { validateProject } from "../domain/project";
import type { Project } from "../domain/types";
export interface Store {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export function browserStore(): Store {
  return {
    getItem: (k) => window.localStorage.getItem(k),
    setItem: (k, v) => window.localStorage.setItem(k, v),
  };
}
export function readProjects(store: Store = browserStore()): Project[] {
  try {
    const data: unknown = JSON.parse(store.getItem("forma-projects") ?? "[]");
    if (!Array.isArray(data)) return [];
    return data.slice(0, 30).flatMap((p) => {
      try {
        return [validateProject(p)];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}
export function writeProjects(
  projects: Project[],
  store: Store = browserStore(),
): void {
  if (projects.length > 30)
    throw Error("Сохранено 30 проектов. Удалите ненужный проект.");
  try {
    store.setItem(
      "forma-projects",
      JSON.stringify(projects.map(validateProject)),
    );
  } catch {
    throw Error(
      "Не удалось сохранить проект: хранилище заполнено или недоступно. Текущий проект остаётся открыт.",
    );
  }
}
export function readDraft(): Project | null {
  try {
    const raw = browserStore().getItem("forma-draft");
    return raw ? validateProject(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}
export function writeDraft(p: Project): void {
  browserStore().setItem("forma-draft", JSON.stringify(validateProject(p)));
}
