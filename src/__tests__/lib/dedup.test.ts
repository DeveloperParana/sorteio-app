import { dedup, countDuplicates } from "@/lib/dedup";

describe("dedup", () => {
  const data = [
    { nome: "Alice", email: "alice@test.com" },
    { nome: "Bob", email: "bob@test.com" },
    { nome: "Alice 2", email: "ALICE@test.com" },
    { nome: "Carol", email: "carol@test.com" },
    { nome: "Bob 2", email: " bob@test.com " },
  ];

  it("removes duplicates case-insensitively", () => {
    const result = dedup(data, "email");
    expect(result.unique).toHaveLength(3);
    expect(result.duplicateCount).toBe(2);
    expect(result.unique.map((r) => r.nome)).toEqual(["Alice", "Bob", "Carol"]);
  });

  it("trims whitespace for comparison", () => {
    const result = dedup(data, "email");
    expect(result.duplicateCount).toBe(2);
  });

  it("returns all rows when no duplicates", () => {
    const unique = [
      { nome: "A", email: "a@t.com" },
      { nome: "B", email: "b@t.com" },
    ];
    const result = dedup(unique, "email");
    expect(result.unique).toHaveLength(2);
    expect(result.duplicateCount).toBe(0);
  });

  it("keeps rows with empty key values", () => {
    const withEmpty = [
      { nome: "A", email: "a@t.com" },
      { nome: "B", email: "" },
      { nome: "C", email: "" },
    ];
    const result = dedup(withEmpty, "email");
    expect(result.unique).toHaveLength(3);
    expect(result.duplicateCount).toBe(0);
  });

  it("handles missing key field gracefully", () => {
    const result = dedup(data, "telefone");
    expect(result.unique).toHaveLength(data.length);
    expect(result.duplicateCount).toBe(0);
  });
});

describe("countDuplicates", () => {
  it("returns just the count", () => {
    const data = [
      { email: "a@t.com" },
      { email: "b@t.com" },
      { email: "a@t.com" },
    ];
    expect(countDuplicates(data, "email")).toBe(1);
  });
});
