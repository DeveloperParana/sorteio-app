import { clearPersistedState } from "@/lib/use-persisted-state";

describe("clearPersistedState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("clears only sorteio-app keys", () => {
    localStorage.setItem("sorteio-app:step", "2");
    localStorage.setItem("sorteio-app:prizes", "[]");
    localStorage.setItem("other-app:data", "test");

    clearPersistedState();

    expect(localStorage.getItem("sorteio-app:step")).toBeNull();
    expect(localStorage.getItem("sorteio-app:prizes")).toBeNull();
    expect(localStorage.getItem("other-app:data")).toBe("test");
  });

  it("handles empty localStorage", () => {
    expect(() => clearPersistedState()).not.toThrow();
  });
});
