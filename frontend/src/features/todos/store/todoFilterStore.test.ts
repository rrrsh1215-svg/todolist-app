import { afterEach, describe, expect, it } from "vitest";
import { useTodoFilterStore } from "./todoFilterStore";

describe("todoFilterStore", () => {
  afterEach(() => {
    useTodoFilterStore.getState().resetFilters();
  });

  it("stores todo filters in memory", () => {
    useTodoFilterStore.getState().setFilters({
      categoryId: "category-id",
      dueDateFrom: "2026-05-01",
      dueDateTo: "2026-05-31",
      isCompleted: false
    });

    expect(useTodoFilterStore.getState().filters).toEqual({
      categoryId: "category-id",
      dueDateFrom: "2026-05-01",
      dueDateTo: "2026-05-31",
      isCompleted: false
    });
  });

  it("removes empty filter values", () => {
    useTodoFilterStore.getState().setFilters({
      categoryId: "",
      dueDateFrom: "2026-05-01"
    });
    useTodoFilterStore.getState().setFilter("dueDateFrom", "");

    expect(useTodoFilterStore.getState().filters).toEqual({});
  });

  it("resets filters", () => {
    useTodoFilterStore.getState().setFilter("isCompleted", true);
    useTodoFilterStore.getState().resetFilters();

    expect(useTodoFilterStore.getState().filters).toEqual({});
  });
});
