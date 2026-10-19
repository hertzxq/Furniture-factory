import { it, expect } from "vitest";
import { createProject } from "./project";
import {
  recordHistory,
  undoHistory,
  redoHistory,
  emptyHistory,
} from "./history";
it("coalesces a slider gesture into one undo entry, then restores redo", () => {
  const p = createProject();
  let state = emptyHistory(p);
  state = recordHistory(state, { ...p, color: "#8a927a" }, "color");
  state = recordHistory(state, { ...p, color: "#454742" }, "color");
  expect(state.past).toHaveLength(1);
  state = undoHistory(state);
  expect(state.current.color).toBe(p.color);
  state = redoHistory(state);
  expect(state.current.color).toBe("#454742");
});
it("new edits clear redo and history is bounded", () => {
  const p = createProject();
  let state = emptyHistory(p);
  for (let i = 0; i < 70; i++)
    state = recordHistory(state, { ...p, name: "Кухня " + i });
  expect(state.past).toHaveLength(50);
  state = undoHistory(state);
  state = recordHistory(state, p);
  expect(state.future).toHaveLength(0);
});
